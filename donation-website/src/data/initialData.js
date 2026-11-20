export const initialCampaigns = [
  {
    _id: "camp-1",
    title: "Education for Every Child",
    description: "Provide school supplies, scholarships, digital tablets, and nutritious meals for 500+ underprivileged rural students.",
    category: "Education",
    targetAmount: 200000,
    collectedAmount: 142500,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=75",
    donorCount: 84,
    organizer: "Vidya Jyoti Foundation",
    daysLeft: 18,
    featured: true
  },
  {
    _id: "camp-2",
    title: "Food for Needy Families",
    description: "Distribute emergency ration kits containing rice, pulses, cooking oil, and flour to daily wage workers and homeless families.",
    category: "Food",
    targetAmount: 100000,
    collectedAmount: 78500,
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&auto=format&fit=crop&q=75",
    donorCount: 62,
    organizer: "Annapurna Relief Mission",
    daysLeft: 12,
    featured: true
  },
  {
    _id: "camp-3",
    title: "Critical Pediatric Heart Surgery",
    description: "Urgent medical fund for life-saving corrective open heart surgeries for 3 newborn infants from low-income families.",
    category: "Healthcare",
    targetAmount: 350000,
    collectedAmount: 285000,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=75",
    donorCount: 145,
    organizer: "Child Life Care Trust",
    daysLeft: 7,
    featured: true
  },
  {
    _id: "camp-4",
    title: "Marriage Support for Poor Girls",
    description: "Support financially struggling families organize dignified marriages by funding essential bridal clothing, household gifts, and ceremony costs.",
    category: "Social Welfare",
    targetAmount: 120000,
    collectedAmount: 89000,
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=75",
    donorCount: 53,
    organizer: "Kanyadaan Welfare Society",
    daysLeft: 22,
    featured: false
  },
  {
    _id: "camp-5",
    title: "Clean Drinking Water for Remote Villages",
    description: "Install solar-powered community water filtration plants in drought-hit arid villages to prevent waterborne diseases.",
    category: "Environment",
    targetAmount: 180000,
    collectedAmount: 115000,
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=75",
    donorCount: 71,
    organizer: "Jal Jeevan Sahayog",
    daysLeft: 30,
    featured: false
  },
  {
    _id: "camp-6",
    title: "Animal Rescue & Winter Shelter",
    description: "Provide emergency veterinary treatment, rescue ambulance fuel, and insulated winter shelters for 200+ injured stray animals.",
    category: "Animal Welfare",
    targetAmount: 90000,
    collectedAmount: 64200,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=75",
    donorCount: 49,
    organizer: "Paws & Hope Sanctuary",
    daysLeft: 15,
    featured: false
  }
];

// Verified Transparency Ledger: Initial transparent contributions
export const initialDonations = [
  {
    _id: "don-rec-1",
    donorName: "Rajesh Kulkarni",
    email: "rajesh.kulkarni@example.com",
    phone: "+91 99887 76655",
    amount: 15000,
    campaignTitle: "Critical Pediatric Heart Surgery",
    campaignId: "camp-3",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    message: "Praying for the little angels' speedy recovery and successful surgeries! 🙏",
    status: "successful",
    paymentMode: "Razorpay Online (UPI/Cards)",
    transactionId: "TXN_RZP_884920",
    isDemo: false
  },
  {
    _id: "don-rec-2",
    donorName: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    amount: 5000,
    campaignTitle: "Education for Every Child",
    campaignId: "camp-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    message: "Education is the best gift we can give to our children.",
    status: "successful",
    paymentMode: "UPI / PhonePe",
    transactionId: "TXN_UPI_773194",
    isDemo: false
  },
  {
    _id: "don-rec-3",
    donorName: "Vikram Malhotra",
    email: "vikram.m@corporategiving.org",
    phone: "+91 98123 45678",
    amount: 25000,
    campaignTitle: "Clean Drinking Water for Remote Villages",
    campaignId: "camp-5",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    message: "Happy to fund community filtration plants for clean drinking water.",
    status: "successful",
    paymentMode: "NetBanking (HDFC Bank)",
    transactionId: "TXN_NET_902184",
    isDemo: false
  },
  {
    _id: "don-rec-4",
    donorName: "Ananya Deshmukh",
    email: "ananya.deshmukh@example.com",
    phone: "+91 97654 32109",
    amount: 10000,
    campaignTitle: "Marriage Support for Poor Girls",
    campaignId: "camp-4",
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    message: "Wishing the brides a blessed, happy, and dignified married life.",
    status: "successful",
    paymentMode: "UPI / Google Pay",
    transactionId: "TXN_UPI_492018",
    isDemo: false
  },
  {
    _id: "don-rec-5",
    donorName: "Dr. Anita Desai",
    email: "dr.anita@healthcaremission.org",
    phone: "+91 94567 12345",
    amount: 8500,
    campaignTitle: "Critical Pediatric Heart Surgery",
    campaignId: "camp-3",
    createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    message: "Supporting our frontline pediatric medical team.",
    status: "successful",
    paymentMode: "Razorpay Online (UPI/Cards)",
    transactionId: "TXN_RZP_664120",
    isDemo: false
  },
  {
    _id: "don-rec-6",
    donorName: "Sunita Mehra",
    email: "sunita.mehra@example.com",
    phone: "+91 93456 78901",
    amount: 3500,
    campaignTitle: "Food for Needy Families",
    campaignId: "camp-2",
    createdAt: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
    message: "May no child or family go to bed hungry tonight.",
    status: "successful",
    paymentMode: "UPI / Paytm",
    transactionId: "TXN_UPI_331908",
    isDemo: false
  },
  {
    _id: "don-rec-7",
    donorName: "Amitabh Roy",
    email: "amitabh.roy@example.com",
    phone: "+91 96543 21098",
    amount: 6000,
    campaignTitle: "Animal Rescue & Winter Shelter",
    campaignId: "camp-6",
    createdAt: new Date(Date.now() - 1000 * 60 * 2400).toISOString(),
    message: "For medical supplies and insulated shelters for street animals. 🐾",
    status: "successful",
    paymentMode: "Razorpay Online (UPI/Cards)",
    transactionId: "TXN_RZP_551294",
    isDemo: false
  },
  {
    _id: "don-rec-8",
    donorName: "Karan Singhania",
    email: "karan.s@enterprise.com",
    phone: "+91 92345 67890",
    amount: 12000,
    campaignTitle: "Education for Every Child",
    campaignId: "camp-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 3200).toISOString(),
    message: "Supporting digital tablets and study material for village schools.",
    status: "successful",
    paymentMode: "NetBanking (ICICI Bank)",
    transactionId: "TXN_NET_881920",
    isDemo: false
  }
];

export const initialNotifications = [
  {
    id: "notif-welcome",
    type: "milestone",
    title: "Platform Ready",
    message: "HelpHands platform is live. Ready to receive transparent donations.",
    time: "Just now",
    timestamp: Date.now(),
    read: false
  }
];

export const initialContacts = [
  {
    _id: "cnt-1",
    name: "Kavita Sen",
    email: "kavita.sen@example.com",
    phone: "+91 98765 43210",
    subject: "Tax Exemption (80G) Certificate",
    message: "Hello team, I made a contribution yesterday. Could you please guide me on how to claim my 80G tax deduction receipt?",
    status: "unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    _id: "cnt-2",
    name: "Dr. Manoj Saxena",
    email: "dr.manoj@hospitaltrust.org",
    phone: "+91 91234 56789",
    subject: "Medical Campaign Verification",
    message: "We are partnering with pediatric hospitals in North India and would love to collaborate on the pediatric heart surgery initiative.",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  }
];
