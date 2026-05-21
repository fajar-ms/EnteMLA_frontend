const commonDepartments = [
  {
    title: "🛣️ Public Works Department (PWD)",
    description: "Roads, bridges, infrastructure maintenance",
    location: "Civil Station",
    phone: "+91 1111111111",
    email: "pwd@gov.in",
    hours: "Mon–Fri: 10 AM – 5 PM",
  },

  {
    title: "💧 Water Supply & Sanitation",
    description: "Drinking water, drainage issues",
    location: "Water Authority Office",
    phone: "+91 2222222222",
    email: "water@gov.in",
    hours: "Mon–Fri: 9 AM – 4 PM",
  },

  {
    title: "⚡ Electricity Board",
    description: "Power supply, outages, maintenance",
    location: "KSEB Regional Office",
    phone: "+91 3333333333",
    email: "electricity@gov.in",
    hours: "24x7 Emergency Support",
  },

  {
    title: "🏥 Health & Welfare",
    description: "Hospitals, medical assistance",
    location: "District Health Office",
    phone: "+91 4444444444",
    email: "health@gov.in",
    hours: "Mon–Sat: 9 AM – 6 PM",
  },

  {
    title: "🏫 Education Department",
    description: "Schools, scholarships, student support",
    location: "Education Office",
    phone: "+91 5555555555",
    email: "education@gov.in",
    hours: "Mon–Fri: 10 AM – 5 PM",
  },

  {
    title: "🚓 Local Administration",
    description: "Public services, civic management",
    location: "Collectorate Office",
    phone: "+91 6666666666",
    email: "admin@gov.in",
    hours: "Mon–Fri: 10 AM – 5 PM",
  },
];

const constituencyNames = [
  "Manjeshwar",
  "Kasaragod",
  "Udma",
  "Kanhangad",
  "Trikaripur",
  "Payyanur",
  "Kalliasseri",
  "Taliparamba",
  "Irikkur",
  "Azhikode",
  "Kannur",
  "Dharmadom",
  "Thalassery",
  "Kuthuparamba",
  "Mattannur",
  "Peravoor",
  "Mananthavady",
  "Sulthan Bathery",
  "Kalpetta",
  "Vatakara",
  "Kuttiadi",
  "Nadapuram",
  "Quilandy",
  "Perambra",
  "Balusseri",
  "Elathur",
  "Kozhikode North",
  "Kozhikode South",
  "Beypore",
  "Kunnamangalam",
  "Koduvally",
  "Thiruvambady",
  "Kondotty",
  "Eranad",
  "Nilambur",
  "Wandoor",
  "Manjeri",
  "Perinthalmanna",
  "Mankada",
  "Malappuram",
  "Vengara",
  "Vallikkunnu",
  "Tirurangadi",
  "Tanur",
  "Tirur",
  "Kottakkal",
  "Thavanur",
  "Ponnani",
  "Thrithala",
  "Pattambi",
  "Shornur",
  "Ottapalam",
  "Kongad",
  "Mannarkkad",
  "Malampuzha",
  "Palakkad",
  "Tarur",
  "Chittur",
  "Nenmara",
  "Alathur",
  "Chelakkara",
  "Kunnamkulam",
  "Guruvayoor",
  "Manalur",
  "Wadakkanchery",
  "Ollur",
  "Thrissur",
  "Nattika",
  "Kaipamangalam",
  "Irinjalakuda",
  "Puthukkad",
  "Chalakudy",
  "Kodungallur",
  "Perumbavoor",
  "Angamaly",
  "Aluva",
  "Kalamassery",
  "Paravur",
  "Vypin",
  "Kochi",
  "Thripunithura",
  "Ernakulam",
  "Thrikkakara",
  "Kunnathunad",
  "Piravom",
  "Muvattupuzha",
  "Kothamangalam",
  "Devikulam",
  "Udumbanchola",
  "Thodupuzha",
  "Idukki",
  "Peerumade",
  "Pala",
  "Kaduthuruthy",
  "Vaikom",
  "Ettumanoor",
  "Kottayam",
  "Puthuppally",
  "Changanassery",
  "Kanjirappally",
  "Poonjar",
  "Aroor",
  "Cherthala",
  "Alappuzha",
  "Ambalappuzha",
  "Haripad",
  "Kayamkulam",
  "Mavelikara",
  "Chengannur",
  "Thiruvalla",
  "Ranni",
  "Aranmula",
  "Konni",
  "Adoor",
  "Chavara",
  "Kunnathur",
  "Kottarakkara",
  "Pathanapuram",
  "Punalur",
  "Chadayamangalam",
  "Kundara",
  "Kollam",
  "Eravipuram",
  "Chathannoor",
  "Varkala",
  "Attingal",
  "Chirayinkeezhu",
  "Nedumangad",
  "Vamanapuram",
  "Kazhakoottam",
  "Vattiyoorkavu",
  "Thiruvananthapuram",
  "Nemom",
  "Aruvikkara",
  "Parassala",
  "Kattakkada",
  "Kovalam",
  "Neyyattinkara",
];

const constituencies = constituencyNames.map((name, index) => ({
  id: index + 1,

  constituency: name,

  mla: {
    name: `${name} MLA`,
    office: `${name} Constituency Office`,
    phone: `+91 9${String(index + 1).padStart(9, "0")}`,
    email: `${name.toLowerCase().replace(/\s+/g, "")}.mla@gov.in`,
    hours: "10:00 AM – 5:00 PM",
  },

  departments: [
  {
    key: "pwd",

    location:
      `Civil Station, ${name}`,

    phone:
      `+91 11${String(index + 1).padStart(8, "0")}`,

    email:
      `pwd.${name
        .toLowerCase()
        .replace(/\s+/g, "")}@gov.in`,

    hours:
      "Mon–Fri: 10 AM – 5 PM",
  },

  {
    key: "water",

    location:
      `Water Authority Office, ${name}`,

    phone:
      `+91 22${String(index + 1).padStart(8, "0")}`,

    email:
      `water.${name
        .toLowerCase()
        .replace(/\s+/g, "")}@gov.in`,

    hours:
      "Mon–Fri: 9 AM – 4 PM",
  },

  {
    key: "electricity",

    location:
      `KSEB Regional Office, ${name}`,

    phone:
      `+91 33${String(index + 1).padStart(8, "0")}`,

    email:
      `electricity.${name
        .toLowerCase()
        .replace(/\s+/g, "")}@gov.in`,

    hours:
      "24x7 Emergency Support",
  },

  {
    key: "health",

    location:
      `District Health Office, ${name}`,

    phone:
      `+91 44${String(index + 1).padStart(8, "0")}`,

    email:
      `health.${name
        .toLowerCase()
        .replace(/\s+/g, "")}@gov.in`,

    hours:
      "Mon–Sat: 9 AM – 6 PM",
  },

  {
    key: "education",

    location:
      `Education Office, ${name}`,

    phone:
      `+91 55${String(index + 1).padStart(8, "0")}`,

    email:
      `education.${name
        .toLowerCase()
        .replace(/\s+/g, "")}@gov.in`,

    hours:
      "Mon–Fri: 10 AM – 5 PM",
  },

  {
    key: "admin",

    location:
      `Collectorate Office, ${name}`,

    phone:
      `+91 66${String(index + 1).padStart(8, "0")}`,

    email:
      `admin.${name
        .toLowerCase()
        .replace(/\s+/g, "")}@gov.in`,

    hours:
      "Mon–Fri: 10 AM – 5 PM",
  },
],
}));

export default constituencies;
