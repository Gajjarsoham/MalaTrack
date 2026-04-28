from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Literal
import mysql.connector
import os
import jwt
import datetime
import hashlib
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Mala Business Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "mala-business-secret-2024")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": int(os.getenv("DB_PORT", "3306")),
}

security = HTTPBearer()

def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        yield conn
    finally:
        conn.close()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class WorkerCreate(BaseModel):
    name: str
    city: str
    phone: Optional[str] = None

class WorkerUpdate(BaseModel):
    name: Optional[str]
    city: Optional[str]
    phone: Optional[str]

class MalaReceiptCreate(BaseModel):
    date: str
    quantity: int
    pattern_name: str
    price_per_piece: float
    payment_status: Literal["paid", "pending"]
    product_name: str
    unit_type: Literal["single", "pair"]

class MalaReceiptUpdate(BaseModel):
    date: Optional[str] = None
    quantity: Optional[int] = None
    pattern_name: Optional[str] = None
    price_per_piece: Optional[float] = None
    payment_status: Optional[str] = None
    product_name: Optional[str] = None

class SellerCreate(BaseModel):
    name: str
    city: str
    phone: Optional[str] = None

class SaleCreate(BaseModel):
    seller_id: int
    date: str
    malas_sold: int
    pattern_name: str
    sell_price_per_piece: float
    making_cost_per_piece: float
    payment_received: float

class SaleUpdate(BaseModel):
    date: Optional[str]
    malas_sold: Optional[int]
    pattern_name: Optional[str]
    sell_price_per_piece: Optional[float]
    making_cost_per_piece: Optional[float]
    payment_received: Optional[float]

# --- Auth ---
@app.post("/api/login")
def login(req: LoginRequest):
    if req.username == ADMIN_USERNAME and req.password == ADMIN_PASSWORD:
        token = jwt.encode({
            "sub": req.username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/me")
def me(auth=Depends(verify_token)):
    return {"username": auth["sub"]}

# --- Dashboard ---
@app.get("/api/dashboard")
def dashboard(auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT COUNT(*) as count FROM workers")
    total_workers = cur.fetchone()["count"]
    cur.execute("SELECT COUNT(*) as count FROM sellers")
    total_sellers = cur.fetchone()["count"]
    cur.execute("SELECT COALESCE(SUM(total_price),0) as total FROM mala_receipts WHERE payment_status='pending'")
    pending_payment = cur.fetchone()["total"]
    cur.execute("SELECT COALESCE(SUM(total_price),0) as total FROM mala_receipts")
    total_making_cost = cur.fetchone()["total"]
    cur.execute("SELECT COALESCE(SUM(sell_price_per_piece * malas_sold),0) as total FROM sales")
    total_revenue = cur.fetchone()["total"]
    cur.execute("SELECT COALESCE(SUM((sell_price_per_piece - making_cost_per_piece) * malas_sold),0) as profit FROM sales")
    total_profit = cur.fetchone()["profit"]
    cur.execute("SELECT COALESCE(SUM(quantity),0) as total FROM mala_receipts")
    total_malas_made = cur.fetchone()["total"]
    cur.execute("SELECT COALESCE(SUM(malas_sold),0) as total FROM sales")
    total_malas_sold = cur.fetchone()["total"]
    cur.close()
    return {
        "total_workers": total_workers,
        "total_sellers": total_sellers,
        "pending_payment": float(pending_payment),
        "total_making_cost": float(total_making_cost),
        "total_revenue": float(total_revenue),
        "total_profit": float(total_profit),
        "total_malas_made": total_malas_made,
        "total_malas_sold": total_malas_sold,
    }

# --- Workers ---
@app.get("/api/workers")
def get_workers(auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT w.*, 
            COALESCE(SUM(r.quantity),0) as total_malas,
            COALESCE(SUM(r.total_price),0) as total_earned,
            COALESCE(SUM(CASE WHEN r.payment_status='pending' THEN r.total_price ELSE 0 END),0) as pending_amount
        FROM workers w
        LEFT JOIN mala_receipts r ON w.id = r.worker_id
        GROUP BY w.id ORDER BY w.name
    """)
    return cur.fetchall()

@app.post("/api/workers")
def create_worker(worker: WorkerCreate, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("INSERT INTO workers (name, city, phone) VALUES (%s, %s, %s)",
                (worker.name, worker.city, worker.phone))
    db.commit()
    cur.execute("SELECT * FROM workers WHERE id = %s", (cur.lastrowid,))
    return cur.fetchone()

@app.put("/api/workers/{worker_id}")
def update_worker(worker_id: int, worker: WorkerUpdate, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    fields, values = [], []
    if worker.name is not None: fields.append("name=%s"); values.append(worker.name)
    if worker.city is not None: fields.append("city=%s"); values.append(worker.city)
    if worker.phone is not None: fields.append("phone=%s"); values.append(worker.phone)
    if not fields:
        raise HTTPException(400, "Nothing to update")
    values.append(worker_id)
    cur.execute(f"UPDATE workers SET {','.join(fields)} WHERE id=%s", values)
    db.commit()
    cur.execute("SELECT * FROM workers WHERE id=%s", (worker_id,))
    return cur.fetchone()

@app.delete("/api/workers/{worker_id}")
def delete_worker(worker_id: int, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM mala_receipts WHERE worker_id=%s", (worker_id,))
    cur.execute("DELETE FROM workers WHERE id=%s", (worker_id,))
    db.commit()
    return {"message": "Deleted"}

# --- Mala Receipts ---
@app.get("/api/workers/{worker_id}/receipts")
def get_receipts(worker_id: int, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM mala_receipts WHERE worker_id=%s ORDER BY date DESC", (worker_id,))
    return cur.fetchall()

@app.post("/api/workers/{worker_id}/receipts")
def add_receipt(worker_id: int, receipt: MalaReceiptCreate, auth=Depends(verify_token), db=Depends(get_db)):
    total = receipt.quantity * receipt.price_per_piece
    cur = db.cursor(dictionary=True)
    cur.execute("""INSERT INTO mala_receipts (worker_id, date, quantity, pattern_name, price_per_piece, total_price, 
                payment_status, product_name, unit_type)
                        VALUES (%s,%s,%s,%s,%s,%s,%s, %s, %s)""",
                (worker_id, receipt.date, receipt.quantity, receipt.pattern_name, receipt.price_per_piece, total, receipt.payment_status, receipt.product_name or "Mala", receipt.unit_type))
    db.commit()
    cur.execute("SELECT * FROM mala_receipts WHERE id=%s", (cur.lastrowid,))
    return cur.fetchone()

@app.put("/api/receipts/{receipt_id}")
def update_receipt(
    receipt_id: int,
    receipt: MalaReceiptUpdate,
    auth=Depends(verify_token),
    db=Depends(get_db)
):
    cur = db.cursor(dictionary=True)

    # 🔹 Get existing record
    cur.execute("SELECT * FROM mala_receipts WHERE id=%s", (receipt_id,))
    existing = cur.fetchone()

    if not existing:
        raise HTTPException(404, "Receipt not found")

    # 🔹 Safe values (avoid 'or' bug)
    qty = receipt.quantity if receipt.quantity is not None else existing["quantity"]
    price = receipt.price_per_piece if receipt.price_per_piece is not None else existing["price_per_piece"]

    total = qty * price

    updated_data = {
        "date": receipt.date if receipt.date is not None else existing["date"],
        "quantity": qty,
        "pattern_name": receipt.pattern_name if receipt.pattern_name is not None else existing["pattern_name"],
        "price_per_piece": price,
        "total_price": total,
        "payment_status": receipt.payment_status if receipt.payment_status is not None else existing["payment_status"],
        "product_name": receipt.product_name if receipt.product_name is not None else existing.get("product_name"),
    }

    # 🔹 Update query
    cur.execute("""
        UPDATE mala_receipts 
        SET date=%s, quantity=%s, pattern_name=%s, price_per_piece=%s, total_price=%s, payment_status=%s, product_name=%s
        WHERE id=%s
    """, (
        updated_data["date"], updated_data["quantity"], updated_data["pattern_name"], updated_data["price_per_piece"], updated_data["total_price"],
        updated_data["payment_status"],
        updated_data["product_name"],
        receipt_id
    ))

    db.commit()

    # 🔹 Return updated record
    cur.execute("SELECT * FROM mala_receipts WHERE id=%s", (receipt_id,))
    return cur.fetchone()

@app.delete("/api/receipts/{receipt_id}")
def delete_receipt(receipt_id: int, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM mala_receipts WHERE id=%s", (receipt_id,))
    db.commit()
    return {"message": "Deleted"}

# --- Sellers ---
@app.get("/api/sellers")
def get_sellers(auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT s.*,
            COALESCE(SUM(sa.malas_sold),0) as total_malas_sold,
            COALESCE(SUM(sa.payment_received),0) as total_received,
            COALESCE(SUM((sa.sell_price_per_piece - sa.making_cost_per_piece)*sa.malas_sold),0) as total_profit
        FROM sellers s
        LEFT JOIN sales sa ON s.id = sa.seller_id
        GROUP BY s.id ORDER BY s.name
    """)
    return cur.fetchall()

@app.post("/api/sellers")
def create_seller(seller: SellerCreate, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("INSERT INTO sellers (name, city, phone) VALUES (%s,%s,%s)", (seller.name, seller.city, seller.phone))
    db.commit()
    cur.execute("SELECT * FROM sellers WHERE id=%s", (cur.lastrowid,))
    return cur.fetchone()

@app.delete("/api/sellers/{seller_id}")
def delete_seller(seller_id: int, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM sales WHERE seller_id=%s", (seller_id,))
    cur.execute("DELETE FROM sellers WHERE id=%s", (seller_id,))
    db.commit()
    return {"message": "Deleted"}

# --- Sales ---
@app.get("/api/sellers/{seller_id}/sales")
def get_sales(seller_id: int, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM sales WHERE seller_id=%s ORDER BY date DESC", (seller_id,))
    return cur.fetchall()

@app.post("/api/sellers/{seller_id}/sales")
def add_sale(seller_id: int, sale: SaleCreate, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    profit = (sale.sell_price_per_piece - sale.making_cost_per_piece) * sale.malas_sold
    cur.execute("""INSERT INTO sales (seller_id, date, malas_sold, pattern_name, sell_price_per_piece, making_cost_per_piece, payment_received, profit)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (seller_id, sale.date, sale.malas_sold, sale.pattern_name, sale.sell_price_per_piece, sale.making_cost_per_piece, sale.payment_received, profit))
    db.commit()
    cur.execute("SELECT * FROM sales WHERE id=%s", (cur.lastrowid,))
    return cur.fetchone()

@app.put("/api/sales/{sale_id}")
def update_sale(sale_id: int, sale: SaleUpdate, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM sales WHERE id=%s", (sale_id,))
    existing = cur.fetchone()
    if not existing:
        raise HTTPException(404, "Sale not found")
    malas = sale.malas_sold if sale.malas_sold is not None else existing["malas_sold"]
    sell_p = sale.sell_price_per_piece if sale.sell_price_per_piece is not None else existing["sell_price_per_piece"]
    make_p = sale.making_cost_per_piece if sale.making_cost_per_piece is not None else existing["making_cost_per_piece"]
    profit = (sell_p - make_p) * malas
    cur.execute("""UPDATE sales SET date=%s,malas_sold=%s,pattern_name=%s,sell_price_per_piece=%s,making_cost_per_piece=%s,payment_received=%s,profit=%s WHERE id=%s""",
                (sale.date or existing["date"], malas, sale.pattern_name or existing["pattern_name"],
                 sell_p, make_p, sale.payment_received if sale.payment_received is not None else existing["payment_received"], profit, sale_id))
    db.commit()
    cur.execute("SELECT * FROM sales WHERE id=%s", (sale_id,))
    return cur.fetchone()

@app.delete("/api/sales/{sale_id}")
def delete_sale(sale_id: int, auth=Depends(verify_token), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM sales WHERE id=%s", (sale_id,))
    db.commit()
    return {"message": "Deleted"}
