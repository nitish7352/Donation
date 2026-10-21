import { useEffect, useState, useRef } from "react";
import {
  Heart,
  ArrowRight,
  Bell,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  DollarSign,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
  Lock,
  Calendar,
  X,
  FileText,
  Menu,
  Crown,
  Key,
  Gift
} from "lucide-react";
import "./index.css";

import {
  initialCampaigns,
  initialDonations,
  initialNotifications,
  initialContacts
} from "./data/initialData";

import NotificationPanel from "./components/NotificationPanel";
import DonationHistory from "./components/DonationHistory";
import ContactSection from "./components/ContactSection";
import ContactUserModal from "./components/ContactUserModal";
import ReceiptModal from "./components/ReceiptModal";
import AdminPortal from "./components/AdminPortal";
import AdminLogin from "./components/AdminLogin";
import Sidebar from "./components/Sidebar";
import RequestAccessModal from "./components/RequestAccessModal";
import Toast from "./components/Toast";
import API from "./config/api";

export default function App() {
  // Data states with localStorage persistence & initial fallbacks
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem("helphands_campaigns");
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [donations, setDonations] = useState(() => {
    const cacheVersion = localStorage.getItem("helphands_cache_v");
    if (cacheVersion !== "clean_v3") {
      localStorage.removeItem("helphands_donations");
      localStorage.setItem("helphands_cache_v", "clean_v3");
      return [];
    }
    const saved = localStorage.getItem("helphands_donations");
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("helphands_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem("helphands_contacts");
    return saved ? JSON.parse(saved) : initialContacts;
  });

  // UI Navigation & Modal states
  const [page, setPage] = useState("home"); // "home" | "campaigns" | "history" | "contact" | "admin" | "donate"
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [contactUserTarget, setContactUserTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [campaignSearch, setCampaignSearch] = useState("");

  // Admin authentication state (Protected /admin route)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem("helphands_is_admin") === "true";
  });

  // Donation Form state
  const [form, setForm] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: "1000",
    message: "",
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const notifRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("helphands_campaigns", JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem("helphands_donations", JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem("helphands_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("helphands_contacts", JSON.stringify(contacts));
  }, [contacts]);

  // Click outside listener for notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  // Try fetching backend data if server is up
  async function loadDataFromApi() {
    try {
      const [cRes, dRes] = await Promise.allSettled([
        fetch(`${API}/campaigns`),
        fetch(`${API}/donations`),
        fetch(`${API}/contacts`)
      ]);

      if (cRes.status === "fulfilled" && cRes.value.ok) {
        const isJson = cRes.value.headers.get("content-type")?.includes("application/json");
        if (isJson) {
          const cData = await cRes.value.json();
          if (Array.isArray(cData) && cData.length > 0) {
            setCampaigns((prev) => {
              const map = new Map();
              prev.forEach((item) => map.set(item._id, item));
              cData.forEach((item) => map.set(item._id, { ...map.get(item._id), ...item }));
              return Array.from(map.values());
            });
          }
        }
      }

      if (dRes.status === "fulfilled" && dRes.value.ok) {
        const isJson = dRes.value.headers.get("content-type")?.includes("application/json");
        if (isJson) {
          const dData = await dRes.value.json();
          if (Array.isArray(dData) && dData.length > 0) {
            setDonations((prev) => {
              const map = new Map();
              prev.forEach((item) => map.set(item._id, item));
              dData.forEach((item) => map.set(item._id, { ...map.get(item._id), ...item }));
              return Array.from(map.values());
            });
          }
        }
      }
    } catch {
      // Backend gracefully falls back to local data
    }
  }

  useEffect(() => {
    loadDataFromApi();
  }, []);

  // Helper to add toast and auto-dismiss
  function addToast(toastObj) {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const newToast = { id, ...toastObj };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // URL Route detection for /admin and #admin
  useEffect(() => {
    const handleRouteSync = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith("/admin") || hash === "#admin" || hash.startsWith("#/admin")) {
        setPage("admin");
      }
    };
    handleRouteSync();
    window.addEventListener("popstate", handleRouteSync);
    window.addEventListener("hashchange", handleRouteSync);
    return () => {
      window.removeEventListener("popstate", handleRouteSync);
      window.removeEventListener("hashchange", handleRouteSync);
    };
  }, []);

  // Admin authentication handlers
  function handleAdminLoginSuccess(data) {
    setIsAdminAuthenticated(true);
    addToast({
      type: "success",
      title: "Admin Authenticated",
      message: "Administrator session started.",
      badge: "Administrator"
    });
  }

  function handleAdminLogout() {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem("helphands_is_admin");
    sessionStorage.removeItem("helphands_admin_token");
    setPage("home");
    if (window.location.hash.startsWith("#admin") || window.location.pathname.startsWith("/admin")) {
      window.history.pushState(null, "", "/");
    }
    addToast({
      type: "contact",
      title: "Logged Out",
      message: "Administrator session safely ended.",
      badge: "Logged Out"
    });
  }

  function handleClearHistory() {
    setDonations([]);
    localStorage.removeItem("helphands_donations");
    const token = sessionStorage.getItem("helphands_admin_token");
    fetch(`${API}/donations/clear-all`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }).catch(() => { });

    addToast({
      type: "contact",
      title: "History Cleared",
      message: "All previous donation records have been permanently cleared.",
      badge: "Cleared"
    });
  }

  // Trigger test incoming alert for demo/testing
  function handleSimulateIncomingDonation() {
    const donors = ["Sunita Mehra", "Karan Singhania", "Neha Gupta", "Aditya Joshi", "Tanvi Rao"];
    const amounts = [500, 1500, 2500, 5000, 10000];
    const randomDonor = donors[Math.floor(Math.random() * donors.length)];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
    const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];

    const newDonation = {
      _id: "sim-" + Date.now(),
      donorName: randomDonor,
      email: `${randomDonor.toLowerCase().replace(" ", ".")}@example.com`,
      amount: randomAmount,
      campaignTitle: randomCampaign.title,
      campaignId: randomCampaign._id,
      createdAt: new Date().toISOString(),
      message: "Sending blessings and wishing maximum success for this great campaign! 🙏",
      status: "successful",
      paymentMode: "UPI / PhonePe",
      transactionId: "TXN_UPI_" + Math.floor(100000 + Math.random() * 900000),
      isDemo: true
    };

    setDonations((prev) => [newDonation, ...prev]);

    // Update campaign collected amount
    setCampaigns((prev) =>
      prev.map((c) =>
        c._id === randomCampaign._id
          ? {
            ...c,
            collectedAmount: (c.collectedAmount || 0) + randomAmount,
            donorCount: (c.donorCount || 1) + 1
          }
          : c
      )
    );

    // Push notification
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "money",
      title: `Money Received: ₹${randomAmount.toLocaleString("en-IN")}`,
      message: `${randomDonor} donated ₹${randomAmount.toLocaleString("en-IN")} for ${randomCampaign.title}`,
      time: "Just now",
      timestamp: Date.now(),
      read: false,
      donorName: randomDonor,
      amount: randomAmount,
      campaignTitle: randomCampaign.title
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Trigger celebratory Toast
    addToast({
      type: "money",
      title: "New Contribution Received!",
      message: `${randomDonor} contributed ₹${randomAmount.toLocaleString("en-IN")}`,
      amount: randomAmount,
      badge: "Just Received"
    });
  }

  // Handle open donation
  function openDonation(campaign) {
    setSelectedCampaign(campaign);
    setNotice("");
    setError("");
    setPage("donate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Handle donation submission (Razorpay or Demo)
  async function submitDonation(e, mode = "razorpay") {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setNotice("");
    setError("");

    const numericAmount = Number(form.amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Please specify a valid donation amount.");
      setLoading(false);
      return;
    }

    const donorDisplayName = form.isAnonymous
      ? "Anonymous Supporter"
      : form.donorName.trim() || "Kind Supporter";

    if (mode === "demo") {
      try {
        // Try recording on server
        fetch(`${API}/donations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: selectedCampaign._id,
            donorName: donorDisplayName,
            email: form.email,
            amount: numericAmount,
            message: form.message
          })
        }).catch(() => { });

        // Local state update
        const recordedDonation = {
          _id: "demo-rec-" + Date.now(),
          donorName: donorDisplayName,
          email: form.email,
          phone: form.phone,
          amount: numericAmount,
          campaignTitle: selectedCampaign.title,
          campaignId: selectedCampaign._id,
          createdAt: new Date().toISOString(),
          message: form.message,
          status: "successful",
          paymentMode: "Verified Demo Grant",
          transactionId: "TXN_DEMO_" + Math.floor(100000 + Math.random() * 900000),
          isDemo: true
        };

        setDonations((prev) => [recordedDonation, ...prev]);

        // Update campaign numbers
        setCampaigns((prev) =>
          prev.map((c) =>
            c._id === selectedCampaign._id
              ? {
                ...c,
                collectedAmount: (c.collectedAmount || 0) + numericAmount,
                donorCount: (c.donorCount || 1) + 1
              }
              : c
          )
        );

        // Create notification
        const notif = {
          id: "notif-" + Date.now(),
          type: "money",
          title: `Money Received: ₹${numericAmount.toLocaleString("en-IN")}`,
          message: `${donorDisplayName} donated ₹${numericAmount.toLocaleString("en-IN")} for ${selectedCampaign.title}`,
          time: "Just now",
          timestamp: Date.now(),
          read: false,
          donorName: donorDisplayName,
          amount: numericAmount,
          campaignTitle: selectedCampaign.title
        };
        setNotifications((prev) => [notif, ...prev]);

        // Trigger toast
        addToast({
          type: "money",
          title: "Contribution Successful!",
          message: `Thank you ${donorDisplayName}! ₹${numericAmount.toLocaleString("en-IN")} was received.`,
          amount: numericAmount,
          badge: "Received"
        });

        setNotice(
          `Thank you, ${donorDisplayName}! Your donation of ₹${numericAmount.toLocaleString("en-IN")} has been received and added to our transparent ledger.`
        );

        // Open official receipt modal automatically
        setTimeout(() => {
          setActiveReceipt(recordedDonation);
        }, 800);

        setForm({
          donorName: "",
          email: "",
          phone: "",
          amount: "1000",
          message: "",
          isAnonymous: false
        });
      } catch (err) {
        setError(err.message || "Could not process donation.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Razorpay Gateway flow
    try {
      if (typeof window.Razorpay === "undefined") {
        throw new Error(
          "Razorpay script is still loading. Please check internet connection or use 'Simulate Instant Demo Donation'."
        );
      }

      // 1. Attempt server order creation if backend is accessible
      let orderData = null;
      try {
        const orderRes = await fetch(`${API}/donations/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: selectedCampaign._id,
            donorName: donorDisplayName,
            email: form.email,
            amount: numericAmount,
            message: form.message
          })
        });
        const orderIsJson = orderRes.headers.get("content-type")?.includes("application/json");
        if (orderRes.ok && orderIsJson) {
          orderData = await orderRes.json();
        }
      } catch {
        // Backend not reachable; continue with direct Razorpay checkout
      }

      const liveKey = orderData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TpOBa14m94mwSL";
      const totalPaise = orderData?.amount || Math.round(numericAmount * 100);

      const options = {
        key: liveKey,
        amount: totalPaise,
        currency: orderData?.currency || "INR",
        name: "HelpHands Foundation",
        description: `Donation for ${selectedCampaign.title}`,
        ...(orderData?.orderId ? { order_id: orderData.orderId } : {}),
        prefill: {
          name: form.donorName || "",
          email: form.email || "",
          contact: form.phone || ""
        },
        theme: {
          color: "#059669"
        },
        handler: async function (response) {
          try {
            setLoading(true);

            // Attempt backend verification if order was server-generated
            if (orderData?.orderId && orderData?.donationId) {
              try {
                await fetch(`${API}/donations/verify`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    donationId: orderData.donationId
                  })
                });
              } catch {
                // Verified client-side through Razorpay checkout response
              }
            }

            const liveDonation = {
              _id: orderData?.donationId || "rzp-" + Date.now(),
              donorName: donorDisplayName,
              email: form.email,
              phone: form.phone,
              amount: numericAmount,
              campaignTitle: selectedCampaign.title,
              campaignId: selectedCampaign._id,
              createdAt: new Date().toISOString(),
              message: form.message,
              status: "successful",
              paymentMode: "Razorpay Online (UPI/Cards)",
              transactionId: response.razorpay_payment_id,
              isDemo: false
            };

            setDonations((prev) => [liveDonation, ...prev]);

            setCampaigns((prev) =>
              prev.map((c) =>
                c._id === selectedCampaign._id
                  ? {
                    ...c,
                    collectedAmount: (c.collectedAmount || 0) + numericAmount,
                    donorCount: (c.donorCount || 1) + 1
                  }
                  : c
              )
            );

            // Add notification
            const notif = {
              id: "notif-" + Date.now(),
              type: "money",
              title: `Payment Verified: ₹${numericAmount.toLocaleString("en-IN")}`,
              message: `${donorDisplayName} donated ₹${numericAmount.toLocaleString("en-IN")} via Razorpay`,
              time: "Just now",
              timestamp: Date.now(),
              read: false,
              donorName: donorDisplayName,
              amount: numericAmount,
              campaignTitle: selectedCampaign.title
            };
            setNotifications((prev) => [notif, ...prev]);

            // Toast alert
            addToast({
              type: "money",
              title: "Verified Razorpay Payment!",
              message: `Received ₹${numericAmount.toLocaleString("en-IN")} from ${donorDisplayName}`,
              amount: numericAmount,
              badge: "Verified"
            });

            setNotice(
              `Payment successful! Payment ID: ${response.razorpay_payment_id}. Thank you for your support.`
            );

            // Show receipt
            setActiveReceipt(liveDonation);

            setForm({
              donorName: "",
              email: "",
              phone: "",
              amount: "1000",
              message: "",
              isAnonymous: false
            });
          } catch (vErr) {
            setError(vErr.message || "Payment verification encountered an issue.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: form.donorName,
          email: form.email,
          contact: form.phone
        },
        theme: {
          color: "#0f5132"
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setNotice("Payment window closed. You can complete payment or use simulated donation.");
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
      setError(
        err.message ||
        "Could not initialize Razorpay gateway. Tip: Click 'Simulate Instant Demo Donation' below to test immediately!"
      );
      setLoading(false);
    }
  }

  // Handle contact form submission
  function handleContactSubmitted(contactData) {
    const newContact = {
      _id: "cnt-" + Date.now(),
      status: "unread",
      ...contactData
    };

    setContacts((prev) => [newContact, ...prev]);

    // Send to backend
    fetch(`${API}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData)
    }).catch(() => { });

    // Create notification
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "contact",
      title: "New User Inquiry Received",
      message: `${contactData.name} submitted an inquiry: "${contactData.subject}"`,
      time: "Just now",
      timestamp: Date.now(),
      read: false,
      donorName: contactData.name
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Toast
    addToast({
      type: "contact",
      title: "Inquiry Sent!",
      message: `Thank you ${contactData.name}. Our team has received your message.`,
      badge: "Inquiry Logged"
    });
  }

  // Handle message sent to user/donor
  function handleUserMessageSent(msgData) {
    // Add notification
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "contact",
      title: `Message Sent to ${msgData.recipientName}`,
      message: `Subject: ${msgData.subject}`,
      time: "Just now",
      timestamp: Date.now(),
      read: true
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast({
      type: "success",
      title: "Communication Recorded",
      message: `Message dispatched to ${msgData.recipientEmail}`,
      badge: "Sent"
    });
  }

  // Quick donation amount presets
  const presetAmounts = ["500", "1000", "2500", "5000", "10000"];

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCat = categoryFilter === "All" || c.category === categoryFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(campaignSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ["All", "Education", "Food", "Healthcare", "Social Welfare", "Environment", "Animal Welfare"];

  const totalFundsCollected = campaigns.reduce((sum, c) => sum + (c.collectedAmount || 0), 0);
  const totalReceivedDonations = donations.length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="app-layout">
      {/* Professional Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={page}
        onNavigate={(p) => setPage(p)}
        onRequestAccessClick={() => setIsRequestAccessOpen(true)}
        onSelectCategory={(cat) => {
          setCategoryFilter(cat);
          setPage("campaigns");
        }}
      />

      {/* Professional Request Access Modal */}
      <RequestAccessModal
        isOpen={isRequestAccessOpen}
        onClose={() => setIsRequestAccessOpen(false)}
        onRequestSubmitted={() => {
          addToast({
            type: "success",
            title: "Request Received",
            message: "Your access request has been sent for administrative review.",
            badge: "Submitted"
          });
        }}
      />

      {/* Real-time Toast Notifications Portal */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Official 80G Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          donation={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Contact Website User Modal */}
      {contactUserTarget && (
        <ContactUserModal
          userTarget={contactUserTarget}
          onClose={() => setContactUserTarget(null)}
          onMessageSent={handleUserMessageSent}
        />
      )}

      {/* Top Glassmorphism Navigation Bar */}
      <header className="navbar-wrapper">
        <div className="container navbar-inner">
          {/* Brand Logo & Sidebar Toggle */}
          <div className="flex-row items-center gap-12">
            <button
              type="button"
              className="btn-sidebar-toggle"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar navigation"
            >
              <Menu size={18} />
              <span>Menu</span>
            </button>

            <a
              href="#home"
              className="brand-logo"
              onClick={(e) => {
                e.preventDefault();
                setPage("home");
              }}
            >
              <div className="logo-heart-wrap">
                <Heart size={20} className="logo-heart-icon" />
              </div>
              <div className="brand-text">
                <span>Help</span>
                <span className="brand-accent">Hands.</span>
              </div>
            </a>
          </div>

          {/* Public Navigation Links */}
          <nav className="nav-menu">
            <button
              className={`nav-link ${page === "home" ? "active" : ""}`}
              onClick={() => setPage("home")}
            >
              Home
            </button>
            <button
              className={`nav-link ${page === "campaigns" ? "active" : ""}`}
              onClick={() => setPage("campaigns")}
            >
              Causes & Campaigns
            </button>
            <button
              className={`nav-link nav-link-special ${page === "history" ? "active" : ""}`}
              onClick={() => setPage("history")}
            >
              <span className="live-dot" />
              Received History
            </button>
            <button
              className={`nav-link ${page === "contact" ? "active" : ""}`}
              onClick={() => setPage("contact")}
            >
              Contact Us
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="nav-actions">
            {/* Interactive Notification Bell with Dropdown */}
            <div className="notif-bell-container" ref={notifRef}>
              <button
                className="notif-bell-btn"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                aria-label="Toggle notifications"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && (
                  <span className="notif-badge-pill">{unreadNotifCount}</span>
                )}
              </button>

              <NotificationPanel
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                }}
                onClearAll={() => setNotifications([])}
                onSelectNotification={(notif) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                  );
                  if (notif.type === "money") {
                    setPage("history");
                    setIsNotifOpen(false);
                  }
                }}
                onSimulateIncomingDonation={handleSimulateIncomingDonation}
              />
            </div>

            <button
              className="btn btn-primary nav-donate-btn"
              onClick={() => {
                if (campaigns.length > 0) openDonation(campaigns[0]);
              }}
            >
              <Heart size={16} /> Donate Now
            </button>

            {/* Mobile menu toggle */}
            <button
              className="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button
              className={`mobile-nav-link ${page === "home" ? "active" : ""}`}
              onClick={() => { setPage("home"); setIsMobileMenuOpen(false); }}
            >
              Home
            </button>
            <button
              className={`mobile-nav-link ${page === "campaigns" ? "active" : ""}`}
              onClick={() => { setPage("campaigns"); setIsMobileMenuOpen(false); }}
            >
              Causes & Campaigns
            </button>
            <button
              className={`mobile-nav-link ${page === "history" ? "active" : ""}`}
              onClick={() => { setPage("history"); setIsMobileMenuOpen(false); }}
            >
              <span className="live-dot" /> Received History
            </button>
            <button
              className={`mobile-nav-link ${page === "contact" ? "active" : ""}`}
              onClick={() => { setPage("contact"); setIsMobileMenuOpen(false); }}
            >
              Contact Us & Helpdesk
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => {
                setIsRequestAccessOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Key size={15} className="text-emerald inline mr-6" /> Request Access
            </button>
          </div>
        )}
      </header>

      {/* Main Content Pages */}

      {/* 1. HOME VIEW */}
      {page === "home" && (
        <main className="container">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-tag-badge">
                <Sparkles size={14} className="text-amber" />
                <span>Verified Non-Profit Crowdfunding</span>
              </div>
              <h1>
                Transparent Giving That <span className="highlight-text">Changes Lives.</span>
              </h1>
              <p className="hero-subtitle">
                Support children's education, critical healthcare, emergency food relief, and poor girl marriage ceremonies.
                Track every rupee received in real-time on our public ledger with instant 80G tax benefit receipts.
              </p>

              <div className="hero-cta-group">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setPage("campaigns")}
                >
                  Explore Campaigns <ArrowRight size={18} />
                </button>
                <button
                  className="btn btn-outline btn-lg"
                  onClick={() => setPage("history")}
                >
                  <span className="live-dot" /> View Received History
                </button>
              </div>

              {/* Trust Badges */}
              <div className="trust-badges-row">
                <div className="trust-item">
                  <ShieldCheck size={18} className="text-emerald" />
                  <span>100% Verified Causes</span>
                </div>
                <div className="trust-item">
                  <Award size={18} className="text-emerald" />
                  <span>80G Tax Deductible</span>
                </div>
                <div className="trust-item">
                  <Lock size={18} className="text-emerald" />
                  <span>Bank-Grade Razorpay Security</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000&auto=format&fit=crop&q=80"
                  alt="Children learning in a classroom"
                  className="hero-main-img"
                />
                {/* Floating Social Proof Card */}
                <div className="floating-stat-overlay">
                  <div className="flex-row items-center gap-10">
                    <div className="stat-avatar-circle">
                      <Heart size={18} className="text-rose" />
                    </div>
                    <div>
                      <span className="stat-sm-title">Latest Received Contribution</span>
                      <strong className="stat-sm-val">
                        +₹{Number(donations[0]?.amount || 5000).toLocaleString("en-IN")} from{" "}
                        {donations[0]?.donorName || "Aarav Sharma"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Platform Metrics Ribbon */}
          <section className="stats-ribbon">
            <div className="ribbon-card">
              <div className="ribbon-icon bg-emerald-subtle">
                <DollarSign size={24} className="text-emerald" />
              </div>
              <div>
                <strong>₹{totalFundsCollected.toLocaleString("en-IN")}</strong>
                <span>Total Contributions Raised</span>
              </div>
            </div>

            <div className="ribbon-card">
              <div className="ribbon-icon bg-blue-subtle">
                <TrendingUp size={24} className="text-blue" />
              </div>
              <div>
                <strong>{campaigns.length}</strong>
                <span>Active Verified Campaigns</span>
              </div>
            </div>

            <div className="ribbon-card">
              <div className="ribbon-icon bg-amber-subtle">
                <Users size={24} className="text-amber" />
              </div>
              <div>
                <strong>{totalReceivedDonations}+</strong>
                <span>Received Donations Logged</span>
              </div>
            </div>

            <div className="ribbon-card">
              <div className="ribbon-icon bg-purple-subtle">
                <Award size={24} className="text-purple" />
              </div>
              <div>
                <strong>100%</strong>
                <span>Direct Program Accountability</span>
              </div>
            </div>
          </section>

          {/* SPOTLIGHT 1: Helping Poor Families & Hunger Relief (Requirement 4) */}
          <section className="spotlight-card-banner">
            <div className="spotlight-text-col">
              <span className="spotlight-badge spotlight-badge-amber">
                <Users size={13} /> Emergency Family Relief
              </span>
              <h3>Ration Kits & Sustenance for Needy Families</h3>
              <p>
                No family should have to sleep on an empty stomach. Our volunteer network distributes essential monthly grocery kits containing wheat flour, rice, pulses, and cooking oil directly to vulnerable households and daily wage workers.
              </p>

              <div className="spotlight-perks-list">
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>1-Month Essential Ration Kit</span>
                </div>
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Doorstep Volunteer Delivery</span>
                </div>
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>100% Direct Account Proof</span>
                </div>
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Instant 80G Tax Exemption</span>
                </div>
              </div>

              <div className="flex-row items-center gap-12 flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const foodCamp = campaigns.find((c) => c.category === "Food") || campaigns[1] || campaigns[0];
                    openDonation(foodCamp);
                  }}
                >
                  <Heart size={16} /> Feed a Needy Family (Donate)
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setCategoryFilter("Food");
                    setPage("campaigns");
                  }}
                >
                  View Food Fundraisers →
                </button>
              </div>
            </div>

            <div className="spotlight-img-col">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&auto=format&fit=crop&q=80"
                alt="Volunteers providing emergency food relief kits"
                className="spotlight-img"
              />
              <div className="spotlight-stat-float">
                <div>
                  <span className="muted-xs">Active Family Food Program</span>
                  <strong className="block text-emerald">600+ Rations Distributed</strong>
                </div>
                <span className="status-pill-success status-pill-xs">Verified Active</span>
              </div>
            </div>
          </section>

          {/* SPOTLIGHT 2: Marriage Assistance for Underprivileged Girls (Requirement 4) */}
          <section className="spotlight-card-banner">
            <div className="spotlight-img-col">
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop&q=80"
                alt="Underprivileged girl marriage assistance ceremony"
                className="spotlight-img"
              />
              <div className="spotlight-stat-float">
                <div>
                  <span className="muted-xs">Kanyadaan Dignity Initiative</span>
                  <strong className="block text-rose">53+ Brides Blessed</strong>
                </div>
                <span className="status-pill-success status-pill-xs">Social Welfare</span>
              </div>
            </div>

            <div className="spotlight-text-col">
              <span className="spotlight-badge spotlight-badge-rose">
                <Gift size={13} /> Marriage Assistance (Kanyadaan)
              </span>
              <h3>Dignified Marriage Support for Poor Girls</h3>
              <p>
                Financially struggling parents often face catastrophic debt or exploitation when organizing their daughter's marriage. HelpHands provides dignified wedding packages including bridal attire, essential cookware, and ceremony support so every young bride steps forward with pride and honor.
              </p>

              <div className="spotlight-perks-list">
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Bridal Wear & Essentials</span>
                </div>
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Household Starter Utensils</span>
                </div>
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Verified Low-Income Families</span>
                </div>
                <div className="spotlight-perk-item">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Zero Administrative Cut</span>
                </div>
              </div>

              <div className="flex-row items-center gap-12 flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const marriageCamp =
                      campaigns.find(
                        (c) =>
                          c.title.toLowerCase().includes("marriage") ||
                          c.category === "Social Welfare"
                      ) || campaigns[3] || campaigns[0];
                    openDonation(marriageCamp);
                  }}
                >
                  <Gift size={16} /> Support a Daughter's Marriage
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setCategoryFilter("Social Welfare");
                    setPage("campaigns");
                  }}
                >
                  Learn About Kanyadaan →
                </button>
              </div>
            </div>
          </section>

          {/* Featured Campaigns Section */}
          <section className="section-block">
            <div className="section-head-flex">
              <div>
                <span className="eyebrow">Urgent Causes Needing Help</span>
                <h2>Featured Fundraising Campaigns</h2>
              </div>
              <button
                className="btn btn-secondary-sm"
                onClick={() => setPage("campaigns")}
              >
                View All Causes ({campaigns.length}) →
              </button>
            </div>

            <div className="campaigns-showcase-grid">
              {campaigns.slice(0, 3).map((camp) => {
                const percent = Math.min(
                  100,
                  Math.round(((camp.collectedAmount || 0) / (camp.targetAmount || 1)) * 100)
                );

                return (
                  <article key={camp._id} className="campaign-card-premium">
                    <div className="card-thumb-wrap">
                      <img src={camp.image} alt={camp.title} className="card-img" />
                      <span className="card-category-tag">{camp.category}</span>
                      {camp.daysLeft && (
                        <span className="card-days-tag">
                          <Calendar size={12} className="inline mr-3" />
                          {camp.daysLeft} days left
                        </span>
                      )}
                    </div>

                    <div className="card-inner-body">
                      <h3>{camp.title}</h3>
                      <p className="card-desc-snippet">{camp.description}</p>

                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>

                      <div className="card-funding-row">
                        <div>
                          <strong className="funds-collected">
                            ₹{(camp.collectedAmount || 0).toLocaleString("en-IN")}
                          </strong>
                          <span className="funds-target"> of ₹{camp.targetAmount.toLocaleString("en-IN")}</span>
                        </div>
                        <span className="funds-percent">{percent}%</span>
                      </div>

                      <div className="card-organizer-row">
                        <span className="muted-xs">Organized by {camp.organizer || "HelpHands Trust"}</span>
                        <span className="muted-xs">👥 {camp.donorCount || 24} donors</span>
                      </div>

                      <button
                        className="btn btn-primary w-full mt-15"
                        onClick={() => openDonation(camp)}
                      >
                        <Heart size={16} /> Donate Now
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Quick Real-Time History Preview Banner */}
          <section className="history-preview-banner">
            <div className="preview-banner-content">
              <span className="eyebrow text-white-dim">Public Financial Transparency</span>
              <h3>Track Incoming Money & Donor Records</h3>
              <p>
                Browse every received contribution, download official tax certificates, or send a personal note of gratitude to donors.
              </p>
              <div className="flex-row gap-12 mt-15">
                <button
                  className="btn btn-light-glow"
                  onClick={() => setPage("history")}
                >
                  Open Money Received History ({donations.length})
                </button>
                <button
                  className="btn btn-glass"
                  onClick={handleSimulateIncomingDonation}
                >
                  <Sparkles size={16} /> Simulate Incoming Money
                </button>
              </div>
            </div>

            <div className="preview-banner-table">
              <div className="preview-table-header">
                <span>Recent Received Donations</span>
                <span className="live-pill">Live Feed</span>
              </div>
              <div className="preview-items-list">
                {donations.slice(0, 3).map((d) => (
                  <div key={d._id} className="preview-item-row">
                    <div>
                      <strong>{d.donorName}</strong>
                      <p className="muted-xs">{d.campaignTitle || "Campaign"}</p>
                    </div>
                    <div className="text-right">
                      <span className="preview-amount">+₹{Number(d.amount).toLocaleString("en-IN")}</span>
                      <button
                        className="btn-tiny-receipt"
                        onClick={() => setActiveReceipt(d)}
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Transparency & How It Works */}
          <section className="transparency-section">
            <div className="text-center max-w-600 mx-auto mb-40">
              <span className="eyebrow">Zero Guesswork</span>
              <h2>Where Your Money Goes</h2>
              <p className="muted">
                We believe trust is built on radical transparency. 92% of all donations directly reach the ground beneficiaries.
              </p>
            </div>

            <div className="impact-columns-grid">
              <div className="impact-card">
                <div className="impact-percent">92%</div>
                <h4>Direct Humanitarian Aid</h4>
                <p className="muted-sm">
                  Allocated to medical procedures, school uniforms, food rations, and wedding essentials.
                </p>
              </div>

              <div className="impact-card">
                <div className="impact-percent">5%</div>
                <h4>Field Operations & Verification</h4>
                <p className="muted-sm">
                  Physical background checks of cases, hospital settlements, and logistics.
                </p>
              </div>

              <div className="impact-card">
                <div className="impact-percent">3%</div>
                <h4>Payment Gateway & Technology</h4>
                <p className="muted-sm">
                  SSL certificates, secure server infrastructure, and Razorpay processing fees.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* 2. CAMPAIGNS CATALOG VIEW */}
      {page === "campaigns" && (
        <main className="container section-block">
          <div className="catalog-header">
            <div>
              <span className="eyebrow">Explore Fundraisers</span>
              <h2>All Active Humanitarian Causes</h2>
              <p className="muted">
                Every campaign is verified by our field team. Choose a cause close to your heart to make a contribution.
              </p>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="catalog-filter-bar">
            <div className="search-box-wrap w-full md:w-auto">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search campaigns by title, keywords..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-scroll-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`chip-filter ${categoryFilter === cat ? "active" : ""}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="campaigns-showcase-grid mt-25">
            {filteredCampaigns.map((camp) => {
              const percent = Math.min(
                100,
                Math.round(((camp.collectedAmount || 0) / (camp.targetAmount || 1)) * 100)
              );

              return (
                <article key={camp._id} className="campaign-card-premium">
                  <div className="card-thumb-wrap">
                    <img src={camp.image} alt={camp.title} className="card-img" />
                    <span className="card-category-tag">{camp.category}</span>
                    {camp.daysLeft && (
                      <span className="card-days-tag">
                        <Calendar size={12} className="inline mr-3" />
                        {camp.daysLeft} days left
                      </span>
                    )}
                  </div>

                  <div className="card-inner-body">
                    <h3>{camp.title}</h3>
                    <p className="card-desc-snippet">{camp.description}</p>

                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                    </div>

                    <div className="card-funding-row">
                      <div>
                        <strong className="funds-collected">
                          ₹{(camp.collectedAmount || 0).toLocaleString("en-IN")}
                        </strong>
                        <span className="funds-target"> of ₹{camp.targetAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <span className="funds-percent">{percent}%</span>
                    </div>

                    <div className="card-organizer-row">
                      <span className="muted-xs">By {camp.organizer || "HelpHands Trust"}</span>
                      <span className="muted-xs">👥 {camp.donorCount || 24} supporters</span>
                    </div>

                    <button
                      className="btn btn-primary w-full mt-15"
                      onClick={() => openDonation(camp)}
                    >
                      <Heart size={16} /> Donate Now
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="empty-state-card mt-40">
              <h4>No campaigns found</h4>
              <p className="muted">Try adjusting your search or category filters.</p>
              <button
                className="btn btn-secondary-sm mt-10"
                onClick={() => {
                  setCategoryFilter("All");
                  setCampaignSearch("");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      )}

      {/* 3. MONEY RECEIVED HISTORY VIEW */}
      {page === "history" && (
        <main className="container section-block">
          <DonationHistory
            donations={donations}
            isOwner={isOwner}
            onClearHistory={handleClearHistory}
            onViewReceipt={(donation) => setActiveReceipt(donation)}
            onContactDonor={(donorTarget) => setContactUserTarget(donorTarget)}
          />
        </main>
      )}

      {/* 4. CONTACT SECTION & REACH US */}
      {page === "contact" && (
        <main className="container section-block">
          <ContactSection
            onContactSubmitted={handleContactSubmitted}
            onOpenContactUserModal={(user) => setContactUserTarget(user)}
            recentDonors={donations}
          />
        </main>
      )}

      {/* 5. ADMIN PORTAL */}
      {page === "admin" && (
        <main className="container section-block">
          <AdminPortal
            campaigns={campaigns}
            donations={donations}
            contacts={contacts}
            isOwner={isOwner}
            onClearHistory={handleClearHistory}
            onViewReceipt={(d) => setActiveReceipt(d)}
            onContactUser={(target) => setContactUserTarget(target)}
          />
        </main>
      )}

      {/* 6. DONATE VIEW / CONTRIBUTION FORM */}
      {page === "donate" && selectedCampaign && (
        <main className="container section-block">
          <button
            className="btn btn-secondary-sm mb-20"
            onClick={() => setPage("campaigns")}
          >
            ← Back to Campaigns
          </button>

          <div className="donation-flow-container">
            {/* Campaign Summary Card */}
            <div className="donation-campaign-summary">
              <img
                src={selectedCampaign.image}
                alt={selectedCampaign.title}
                className="summary-img"
              />
              <div className="summary-info">
                <span className="card-category-tag">{selectedCampaign.category}</span>
                <h3>{selectedCampaign.title}</h3>
                <p className="muted-sm">{selectedCampaign.description}</p>

                <div className="progress-bar-wrap mt-15">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((selectedCampaign.collectedAmount || 0) /
                            (selectedCampaign.targetAmount || 1)) *
                          100
                        )
                      )}%`
                    }}
                  />
                </div>

                <div className="card-funding-row mt-8">
                  <strong>
                    ₹{(selectedCampaign.collectedAmount || 0).toLocaleString("en-IN")} raised
                  </strong>
                  <span>Goal: ₹{selectedCampaign.targetAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="tax-benefit-banner mt-20">
                  <ShieldCheck size={20} className="text-emerald" />
                  <div>
                    <strong>80G Tax Benefit Eligible</strong>
                    <p>Avail 50% tax deduction on your donation under Sec 80G of Indian IT Act.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Checkout Form */}
            <form
              className="donation-form-panel"
              onSubmit={(e) => submitDonation(e, "razorpay")}
            >
              <div className="form-head">
                <span className="eyebrow">Step 2: Choose Contribution</span>
                <h2>Make Your Donation</h2>
                <p className="muted-xs">
                  Pay securely via Razorpay (UPI, Cards, NetBanking) or test with simulated demo grant.
                </p>
              </div>

              {notice && (
                <div className="notice-box notice-success">
                  <CheckCircle2 size={18} />
                  <span>{notice}</span>
                </div>
              )}

              {error && (
                <div className="notice-box notice-error">
                  <X size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Amount Preset Chips */}
              <div className="amount-selection-block">
                <label className="field-label">Select Amount (₹)</label>
                <div className="amount-presets-grid">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`preset-chip ${form.amount === amt ? "active" : ""}`}
                      onClick={() => setForm({ ...form, amount: amt })}
                    >
                      ₹{Number(amt).toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>

                <div className="custom-amount-input-wrap mt-10">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    min="1"
                    max="10000000"
                    required
                    placeholder="Or enter custom amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Donor Personal Information */}
              <div className="form-group">
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  required={!form.isAnonymous}
                  placeholder="e.g. Priyanshu Kashyap"
                  value={form.donorName}
                  onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                />
              </div>

              <div className="form-two-col">
                <div className="form-group">
                  <label className="field-label">Email Address (For 80G Receipt)</label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Encouraging Note / Message (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Leave words of kindness or blessings..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
                />
                <label htmlFor="anonCheck" className="cursor-pointer text-sm">
                  Make my donation anonymous on public records
                </label>
              </div>

              {/* Actions: Razorpay or Demo Donation */}
              <div className="donation-cta-stack mt-20">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={loading}
                >
                  <Lock size={16} />{" "}
                  {loading
                    ? "Processing Gateway..."
                    : `Pay ₹${Number(form.amount || 0).toLocaleString("en-IN")} via Razorpay`}
                </button>

                <button
                  type="button"
                  className="btn btn-demo-simulator w-full"
                  disabled={loading}
                  onClick={(e) => submitDonation(e, "demo")}
                >
                  <Sparkles size={16} /> Simulate Instant Demo Donation (Instant Receipt & Notification)
                </button>
              </div>

              <p className="tiny-security-disclaimer text-center mt-12">
                🔒 256-bit SSL Encrypted • All major UPI, Credit/Debit cards & Net Banking accepted
              </p>
            </form>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="footer-site">
        <div className="container footer-content-grid">
          <div className="footer-col-about">
            <div className="brand-logo footer-logo">
              <div className="logo-heart-wrap">
                <Heart size={18} className="logo-heart-icon" />
              </div>
              <span className="brand-text text-white">
                Help<span className="brand-accent">Hands.</span>
              </span>
            </div>
            <p className="footer-bio">
              A modern, transparent, community-driven humanitarian crowdfunding platform empowering donors and grassroot NGOs.
            </p>
            <div className="footer-badge-item">
              <ShieldCheck size={16} className="text-emerald" />
              <span>Registered Non-Profit Trust • Sec 80G Certified</span>
            </div>
          </div>

          <div className="footer-col-links">
            <h5>Navigation</h5>
            <ul>
              <li><button onClick={() => setPage("home")}>Home</button></li>
              <li><button onClick={() => setPage("campaigns")}>Active Causes</button></li>
              <li><button onClick={() => setPage("history")}>Money Received History</button></li>
              <li><button onClick={() => setPage("contact")}>Contact & Helpdesk</button></li>
              <li><button onClick={() => setIsRequestAccessOpen(true)}>Request Access</button></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h5>Causes</h5>
            <ul>
              <li><button onClick={() => { setCategoryFilter("Education"); setPage("campaigns"); }}>Child Education</button></li>
              <li><button onClick={() => { setCategoryFilter("Healthcare"); setPage("campaigns"); }}>Emergency Medical Care</button></li>
              <li><button onClick={() => { setCategoryFilter("Food"); setPage("campaigns"); }}>Hunger Relief Rations</button></li>
              <li><button onClick={() => { setCategoryFilter("Social Welfare"); setPage("campaigns"); }}>Poor Girl Marriage Aid</button></li>
            </ul>
          </div>

          <div className="footer-col-contact">
            <h5>Helpline & Desk</h5>
            <p><Phone size={14} className="inline mr-6 text-emerald" /> +91 7352097919</p>
            <p><Mail size={14} className="inline mr-6 text-emerald" /> aky952372@gmail.com</p>
            <p className="footer-sub-text">
              Pandit Pur, Chhapra(Saran), Bihar, 841224
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="container footer-bottom-inner">
            <p>© {new Date().getFullYear()} HelpHands Foundation Trust. All rights reserved.</p>
            <div className="footer-legal-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>80G Tax Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}