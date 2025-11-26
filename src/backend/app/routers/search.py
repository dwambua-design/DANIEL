from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.utils.dependencies import get_db
from app.models.search_query import SearchQuery
from app.models.listing import Listing
from sqlalchemy import or_
router = APIRouter()


# -------------------------
#  LOG A SEARCH EVENT
# -------------------------
@router.post("/log")
def log_search(
    payload: dict,
    db: Session = Depends(get_db),
):
    query_text = payload.get("query_text")
    category = payload.get("category")
    location = payload.get("location")
    results_count = payload.get("results_count", 0)
    user_id = payload.get("user_id")
    device_type = payload.get("device_type")

    if not query_text:
        return {"error": "query_text required"}

    entry = SearchQuery(
        user_id=user_id,
        query_text=query_text,
        category=category,
        location=location,
        results_count=results_count,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {"status": "logged", "id": entry.id}
    

# -------------------------
#  SEARCH INSIGHTS
# -------------------------
@router.get("/insights")
def search_insights(db: Session = Depends(get_db)):

    # Popular searches
    popular = (
        db.query(
            SearchQuery.query_text,
            func.count(SearchQuery.id).label("freq")
        )
        .group_by(SearchQuery.query_text)
        .order_by(func.count(SearchQuery.id).desc())
        .limit(10)
        .all()
    )

    popular_searches = [
        {"term": term, "count": freq}
        for term, freq in popular
    ]

    # Suggested searches (low result count)
    suggested = (
        db.query(SearchQuery.query_text)
        .filter(SearchQuery.results_count < 3)
        .group_by(SearchQuery.query_text)
        .order_by(func.count(SearchQuery.id).desc())
        .limit(10)
        .all()
    )

    suggested_terms = [term for (term,) in suggested]

    return {
        "popular_searches": popular_searches,
        "suggested_searches": suggested_terms,
    }


# -------------------------
#  POPULAR CATEGORIES
# -------------------------
@router.get("/popular-categories")
def popular_categories(db: Session = Depends(get_db)):

    categories = (
        db.query(
            SearchQuery.category,
            func.count(SearchQuery.id).label("freq")
        )
        .filter(SearchQuery.category != None)
        .group_by(SearchQuery.category)
        .order_by(func.count(SearchQuery.id).desc())
        .limit(10)
        .all()
    )

    cat_list = [c for (c, _) in categories]

    return {"popular_categories": cat_list}




@router.get("/")
def get_listings(
    search: str | None = None,
    category: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Listing)

    # Keyword search
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Listing.title.ilike(like),
                Listing.description.ilike(like)
            )
        )

    # Category filter
    if category:
        query = query.filter(Listing.category == category)

    # Location filter
    if location:
        query = query.filter(Listing.location == location)

    listings = query.order_by(Listing.created_at.desc()).all()

    return {"results": listings, "count": len(listings)}


@router.get("/quick")
def quick_search(q: str, db: Session = Depends(get_db)):
    if not q.strip():
        return []

    results = (
        db.query(Listing)
        .filter(
            or_(
                Listing.title.ilike(f"%{q}%"),
                Listing.description.ilike(f"%{q}%"),
                Listing.category.ilike(f"%{q}%"),
                Listing.location.ilike(f"%{q}%"),
            )
        )
        .limit(5)
        .all()
    )

    return [
        {"id": l.id, "title": l.title, "price": l.price}
        for l in results
    ]

@router.get("/listings")
def search_listings(
    q: str = Query("", alias="q"),
    category: str = Query("", alias="category"),
    sort: str = Query("relevance", alias="sort"),
    db: Session = Depends(get_db)
):
    # Base query — NOTE joinedload here
    query = (
        db.query(Listing)
        .options(joinedload(Listing.images))
    )

    # Apply search text filter
    if q:
        query = query.filter(
            or_(
                Listing.title.ilike(f"%{q}%"),
                Listing.description.ilike(f"%{q}%")
            )
        )

    # Apply category filter
    if category:
        query = query.filter(Listing.category == category)

    # Sorting
    if sort == "price_low":
        query = query.order_by(Listing.price.asc())
    elif sort == "price_high":
        query = query.order_by(Listing.price.desc())
    else:  # relevance or default
        query = query.order_by(Listing.created_at.desc())

    results = query.all()

    return {
        "results": results,
        "count": len(results)
    }