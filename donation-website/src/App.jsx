
import { useEffect, useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
];

const initialCampaigns = [
  {
    _id: "demo-1",
    title: "Education for Every Child",
    description: "Support school supplies, books and learning opportunities.",
    category: "Education",
    targetAmount: 100000,
    collectedAmount: 25000,
    image: fallbackImages[0]
  },
  {
    _id: "demo-2",
    title: "Food for Needy Families",
    description: "Help provide essential meals to families in need.",
    category: "Food",
    targetAmount: 50000,
    collectedAmount: 18000,
    image: fallbackImages[1]
  },
  {
    _id: "demo-3",
    title: "Medical Care for Everyone",
    description: "Help people access essential medical care and supplies.",
    category: "Healthcare",
    targetAmount: 150000,
    collectedAmount: 60000,
    image: fallbackImages[2]
  }
];

function App() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selected, setSelected] = useState(null);
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({
    donorName: "",
    email: "",
    amount: "500",
    message: ""
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("home");

  async function loadData() {
    try {
      const [c, d] = await Promise.all([
        fetch(`${API}/campaigns`),
        fetch(`${API}/donations`)
      ]);

      if (!c.ok || !d.ok) throw new Error("API unavailable");

      setCampaigns(await c.json());
      setDonations(await d.json());
    } catch {
      setError("Cannot connect to the backend. Start MongoDB and the server.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openDonation(campaign) {
    setSelected(campaign);
    setNotice("");
    setError("");
    setPage("donate");
  }

  async function submitDonation(e, mode = "razorpay") {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setNotice("");
    setError("");

    if (mode === "demo") {
      try {
        const response = await fetch(`${API}/donations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: selected._id,
            ...form
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setNotice("Demo donation recorded! No real payment was charged.");
        setForm({ donorName: "", email: "", amount: "500", message: "" });
        await loadData();
      } catch (err) {
        setError(err.message || "Donation could not be recorded.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Razorpay flow
    try {
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK is loading. Please check your internet connection or try again.");
      }

      const orderRes = await fetch(`${API}/donations/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selected._id,
          ...form
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to create Razorpay order.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "HelpHands Donation",
        description: `Contribution for ${selected.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await fetch(`${API}/donations/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: orderData.donationId,
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || "Payment verification failed.");
            }

            setNotice(
              `Payment successful! Thank you for donating ₹${Number(form.amount).toLocaleString("en-IN")}. Payment ID: ${response.razorpay_payment_id}`
            );
            setForm({ donorName: "", email: "", amount: "500", message: "" });
            await loadData();
          } catch (vErr) {
            setError(vErr.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: form.donorName,
          email: form.email,
        },
        theme: {
          color: "#246b49",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setNotice("Payment was cancelled or closed.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setError(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Unable to initiate Razorpay payment.");
      setLoading(false);
    }
  }

  const total = campaigns.reduce(
    (sum, c) => sum + (c.collectedAmount || 0), 0
  );

  return (
    <>
      <header className="container navbar">
        <a href="#home" className="logo"
          onClick={() => setPage("home")}>
          Help<span>Hands.</span>
        </a>

        <nav className="nav-links">
          <a href="#home" onClick={() => setPage("home")}>Home</a>
          <a href="#campaigns"
            onClick={() => setPage("home")}>Campaigns</a>
          <button className="btn"
            onClick={() => setPage("admin")}>
            Admin
          </button>
        </nav>
      </header>

      {page === "home" && (
        <main className="container">
          <section className="hero" id="home">
            <div>
              <span className="eyebrow">
                Small acts. Big impact.
              </span>
              <h1>Together, we can make the world kinder.</h1>
              <p>
                Support education, food and healthcare.
                Every contribution can help create a brighter future.
              </p>
              <a href="#campaigns" className="btn">
                Explore campaigns <ArrowRight size={17} />
              </a>
            </div>

            <img className="hero-image"
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000"
              alt="Children learning together" />
          </section>

          <section className="stats">
            <div className="stat">
              <strong>{campaigns.length}</strong>
              Campaigns
            </div>
            <div className="stat">
              <strong>₹{total.toLocaleString("en-IN")}</strong>
              Demo contributions
            </div>
            <div className="stat">
              <strong>{donations.length}</strong>
              Demo donations
            </div>
          </section>

          <section className="section" id="campaigns">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Make a difference</span>
                <h2>Causes worth supporting</h2>
              </div>
              <span className="muted">
                Choose a campaign to get started
              </span>
            </div>

            {error && <div className="notice">{error}</div>}

            <div className="campaign-grid">
              {campaigns.map((c, i) => {
                const percent = Math.min(
                  100,
                  Math.round(c.collectedAmount / c.targetAmount * 100)
                );

                return (
                  <article className="campaign-card" key={c._id}>
                    <img
                      src={c.image || fallbackImages[i % 3]}
                      alt={c.title}
                    />
                    <div className="card-content">
                      <span className="category">{c.category}</span>
                      <h3>{c.title}</h3>
                      <p className="muted">{c.description}</p>
                      <div className="progress">
                        <div style={{ width: `${percent}%` }} />
                      </div>
                      <div className="amount-row">
                        <strong>
                          ₹{c.collectedAmount.toLocaleString("en-IN")}
                        </strong>
                        <span>of ₹{c.targetAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <p className="muted">{percent}% of demo target</p>
                      <button className="btn"
                        onClick={() => openDonation(c)}>
                        <Heart size={16} /> Donate
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {page === "donate" && selected && (
        <main className="container section">
          <button className="btn btn-light"
            onClick={() => setPage("home")}>
            ← Back to campaigns
          </button>

          <form className="form-card" onSubmit={(e) => submitDonation(e, "razorpay")}>
            <span className="eyebrow">Make a Contribution</span>
            <h2>Support {selected.title}</h2>
            <p className="muted">
              Choose to pay securely via Razorpay (UPI, Cards, NetBanking) or test with simulated demo donation.
            </p>

            {notice && <div className="notice">{notice}</div>}
            {error && <div className="notice" style={{ background: "#fde8e8", color: "#9b1c1c" }}>{error}</div>}

            <label htmlFor="donorName">Your name</label>
            <input id="donorName" required maxLength="100"
              value={form.donorName}
              onChange={e => setForm({
                ...form, donorName: e.target.value
              })} />

            <label htmlFor="email">Email (optional)</label>
            <input id="email" type="email" maxLength="254"
              value={form.email}
              onChange={e => setForm({
                ...form, email: e.target.value
              })} />

            <label htmlFor="amount">Donation amount (₹)</label>
            <input id="amount" type="number" min="1"
              max="10000000" required
              value={form.amount}
              onChange={e => setForm({
                ...form, amount: e.target.value
              })} />

            <label htmlFor="message">Message (optional)</label>
            <textarea id="message" rows="3" maxLength="500"
              value={form.message}
              onChange={e => setForm({
                ...form, message: e.target.value
              })} />

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Processing..." : `Pay ₹${Number(form.amount || 0).toLocaleString("en-IN")} via Razorpay`}
              </button>
              <button
                type="button"
                className="btn btn-light"
                disabled={loading}
                onClick={(e) => submitDonation(e, "demo")}
              >
                Simulate Demo Donation (No Payment Gateway)
              </button>
            </div>
          </form>
        </main>
      )}

      {page === "admin" && (
        <main className="container section">
          <button className="btn btn-light"
            onClick={() => setPage("home")}>
            ← Home
          </button>
          <h2>Admin overview</h2>
          <p className="muted">
            College demo only. This page is not protected by
            admin authentication yet.
          </p>
          <div className="stats">
            <div className="stat">
              <strong>{campaigns.length}</strong> Campaigns
            </div>
            <div className="stat">
              <strong>{donations.length}</strong> Demo donations
            </div>
            <div className="stat">
              <strong>₹{total.toLocaleString("en-IN")}</strong>
              Demo total
            </div>
          </div>

          <h3>Recent demo donations</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d._id}>
                    <td>{d.donorName}</td>
                    <td>{d.campaign?.title || "Campaign"}</td>
                    <td>₹{d.amount.toLocaleString("en-IN")}</td>
                    <td>Demo only</td>
                  </tr>
                ))}
                {donations.length === 0 && (
                  <tr>
                    <td colSpan="4">No demo donations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      <footer className="footer">
        <div className="container">
          <h3>HelpHands. <Heart size={16} /></h3>
          <p>Built as a MERN stack college project.</p>
          <small>
            Demo amounts are simulated and do not represent actual funds.
          </small>
        </div>
      </footer>
    </>
  );
}

export default App;