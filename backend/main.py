import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional

import database

TRUSTEDFORM_API_KEY = "YOUR_TRUSTEDFORM_API_KEY"

app = FastAPI(title="SmartBuyerQuotes API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    database.init_db()

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def retain_trusted_form_cert(cert_url: str) -> dict:
    """
    Retain / Claim a TrustedForm certificate using ActiveProspect API key.
    ActiveProspect TrustedForm Retain API:
    POST to the certificate URL with Basic Auth: username='API', password=TRUSTEDFORM_API_KEY.
    Headers: Accept: application/json
    """
    if not cert_url:
        return {"retained": False, "cert_id": "", "error": "No certificate URL provided"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                cert_url,
                auth=("API", TRUSTEDFORM_API_KEY),
                headers={"Accept": "application/json", "Content-Type": "application/json"},
                json={"vendor": "SmartBuyerQuotes"}
            )
            if response.status_code in (200, 201):
                data = response.json()
                cert_id = data.get("id") or data.get("cert_id") or ""
                print(f"[TrustedForm] Certificate retained successfully: {cert_id}")
                return {"retained": True, "cert_id": cert_id, "data": data}
            else:
                # Fallback to claims endpoint if cert_url direct post didn't return 200/201
                alt_resp = await client.post(
                    "https://api.trustedform.com/claims",
                    auth=("API", TRUSTEDFORM_API_KEY),
                    headers={"Accept": "application/json", "Content-Type": "application/json"},
                    json={"match_lead_url": cert_url}
                )
                if alt_resp.status_code in (200, 201):
                    data = alt_resp.json()
                    cert_id = data.get("id") or ""
                    print(f"[TrustedForm] Certificate claimed via API claims: {cert_id}")
                    return {"retained": True, "cert_id": cert_id, "data": data}

                print(f"[TrustedForm] Retention response status {response.status_code}: {response.text}")
                return {
                    "retained": False,
                    "cert_id": "",
                    "status_code": response.status_code,
                    "error": response.text
                }
    except Exception as e:
        print(f"[TrustedForm] Retention error: {e}")
        return {"retained": False, "cert_id": "", "error": str(e)}


# ── Models ──────────────────────────────────────────────
class QuoteRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    service_type: str
    zip_code: str
    message: Optional[str] = None
    date_of_birth: Optional[str] = None
    current_provider: Optional[str] = None
    household_size: Optional[str] = None
    annual_income_range: Optional[str] = None
    trusted_form_cert_url: Optional[str] = None
    xxTrustedFormCertUrl: Optional[str] = None



# ── Data ────────────────────────────────────────────────
SERVICES = [
    {
        "id": 1,
        "title": "Health Insurance",
        "description": "Find affordable health coverage plans tailored to your needs and budget. Compare options from leading providers.",
        "icon": "health",
        "color": "#4ecdc4",
    },
    {
        "id": 2,
        "title": "Home Improvement",
        "description": "Connect with pre-screened, top-rated contractors in your area for renovations, repairs, and remodeling.",
        "icon": "home",
        "color": "#f0a500",
    },
    {
        "id": 3,
        "title": "Auto & Home Insurance",
        "description": "Bundle your auto and home policies to unlock significant savings with trusted insurance carriers.",
        "icon": "auto",
        "color": "#6c63ff",
    },
    {
        "id": 4,
        "title": "Debt Relief",
        "description": "Explore proven solutions to manage and reduce your debt. Get matched with certified financial advisors.",
        "icon": "debt",
        "color": "#ff6b6b",
    },
    {
        "id": 5,
        "title": "Legal Help",
        "description": "Connect with qualified, experienced local attorneys who specialize in your specific legal needs.",
        "icon": "legal",
        "color": "#a29bfe",
    },
    {
        "id": 6,
        "title": "Medicare",
        "description": "Navigate Medicare plans with confidence. Compare Medicare Advantage, Supplement, and Part D options.",
        "icon": "medicare",
        "color": "#00b894",
    },
]

HOW_IT_WORKS = [
    {
        "step": 1,
        "title": "Tell Us What You Need",
        "description": "Answer a few quick questions about the service you're looking for. It takes less than 2 minutes.",
        "icon": "clipboard",
    },
    {
        "step": 2,
        "title": "Compare Top Quotes",
        "description": "We match you with pre-screened professionals and deliver competitive quotes directly to you.",
        "icon": "compare",
    },
    {
        "step": 3,
        "title": "Choose & Save",
        "description": "Review your options, pick the best fit, and start saving today. No obligations, no hidden fees.",
        "icon": "save",
    },
]

TESTIMONIALS = [
    {
        "id": 1,
        "name": "Sarah Mitchell",
        "role": "Homeowner, Austin TX",
        "quote": "SmartBuyerQuotes saved me over $1,200 on my home insurance. The comparison process was incredibly easy and I had quotes within minutes.",
        "rating": 5,
        "avatar_initial": "S",
    },
    {
        "id": 2,
        "name": "James Rodriguez",
        "role": "Small Business Owner, Miami FL",
        "quote": "I was drowning in debt and didn't know where to turn. This platform connected me with an advisor who created a realistic payoff plan.",
        "rating": 5,
        "avatar_initial": "J",
    },
    {
        "id": 3,
        "name": "Linda Chen",
        "role": "Retiree, Portland OR",
        "quote": "Navigating Medicare was so confusing until I found SmartBuyerQuotes. They made it simple to compare plans and find the right coverage.",
        "rating": 5,
        "avatar_initial": "L",
    },
    {
        "id": 4,
        "name": "Marcus Thompson",
        "role": "New Homeowner, Denver CO",
        "quote": "Found an amazing contractor for my kitchen renovation through this site. The whole process from quote to completion was seamless.",
        "rating": 4,
        "avatar_initial": "M",
    },
]

FAQS = [
    {
        "id": 1,
        "question": "Is SmartBuyerQuotes really free to use?",
        "answer": "Yes, absolutely! Our comparison service is 100% free for consumers. We are compensated by our network of service providers, so you never pay a dime to use our platform.",
    },
    {
        "id": 2,
        "question": "How do you find and vet professionals?",
        "answer": "We partner with a nationwide network of licensed, insured, and pre-screened professionals. Every provider in our network undergoes a thorough background check and must meet our quality standards before they can offer quotes through our platform.",
    },
    {
        "id": 3,
        "question": "How quickly will I receive quotes?",
        "answer": "Most users receive their first quotes within minutes of submitting a request. Depending on the service type and your location, you may receive multiple quotes within the first hour.",
    },
    {
        "id": 4,
        "question": "Is my personal information secure?",
        "answer": "Absolutely. We use industry-standard 256-bit SSL encryption to protect your data. We never sell your personal information to third parties, and you can request deletion of your data at any time.",
    },
    {
        "id": 5,
        "question": "Can I compare quotes from multiple providers?",
        "answer": "Yes — that's our core feature! We present you with multiple competitive quotes side-by-side so you can easily compare pricing, coverage, and reviews to make the best decision.",
    },
    {
        "id": 6,
        "question": "What areas do you serve?",
        "answer": "We serve customers across all 50 US states. Our network includes thousands of professionals and providers nationwide, ensuring coverage no matter where you live.",
    },
]


# ── Endpoints ───────────────────────────────────────────
@app.get("/api/services")
async def get_services():
    return {"services": SERVICES}


@app.get("/api/how-it-works")
async def get_how_it_works():
    return {"steps": HOW_IT_WORKS}


@app.get("/api/testimonials")
async def get_testimonials():
    return {"testimonials": TESTIMONIALS}


@app.get("/api/faqs")
async def get_faqs():
    return {"faqs": FAQS}


@app.post("/api/quote-request")
async def submit_quote_request(request: QuoteRequest):
    # Split full name into first and last name for database storage
    name_parts = request.full_name.strip().split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # TrustedForm Certificate retention
    tf_cert_url = request.trusted_form_cert_url or request.xxTrustedFormCertUrl or ""
    tf_result = {"retained": False, "cert_id": ""}
    if tf_cert_url:
        tf_result = await retain_trusted_form_cert(tf_cert_url)

    lead_id = database.create_lead({
        "first_name": first_name,
        "last_name": last_name,
        "email": request.email,
        "phone": request.phone,
        "zip_code": request.zip_code,
        "date_of_birth": request.date_of_birth or "",
        "service_type": request.service_type,
        "current_provider": request.current_provider or "",
        "household_size": request.household_size or "",
        "annual_income_range": request.annual_income_range or "",
        "consent": True,
        "trusted_form_cert_url": tf_cert_url,
        "trusted_form_retained": tf_result.get("retained", False),
        "trusted_form_cert_id": tf_result.get("cert_id", ""),
    })

    return {
        "success": True,
        "lead_id": lead_id,
        "trusted_form": tf_result,
        "message": f"Thank you, {request.full_name}! Your quote request for {request.service_type} has been received. We'll reach out shortly.",
    }


@app.get("/api/leads")
async def get_leads_list(search: str = "", status: str = "", page: int = 1, per_page: int = 20):
    return database.get_leads(search=search, status=status, page=page, per_page=per_page)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


# Serve static frontend production build if present
import os
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")


