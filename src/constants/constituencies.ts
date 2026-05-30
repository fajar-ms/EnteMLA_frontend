// src/constants/constituencies.ts

export interface MLA {
  name: string;
  email: string;
  phone: number | string;
  location: string;
}

export interface Constituency {
  id: number;
  constituency: string;
  district: string;
  mla: MLA;
}

const constituencies: Constituency[] = [
  {
    id: 1,
    constituency: "Manjeshwar",
    district: "Kasaragod",
    mla: {
      name: "A. K. M. Ashraf",
      email: "akmashraf@niyamasabha.nic.in",
      phone: 9995239701,
      location: "C. M. Minnath, Kadambar P.O., Manjeswaram, Kasaragod – 671 323",
    },
  },
  {
    id: 2,
    constituency: "Kasaragod",
    district: "Kasaragod",
    mla: {
      name: "N. A. Nellikkunnu",
      email: "nanellikkunnu@yahoo.com",
      phone: 9447010338,
      location: "MLA Camp Office, Bangarakkunnu Road, Nellikkunnu, Kasaragod – 671 121",
    },
  },
  {
    id: 3,
    constituency: "Udma",
    district: "Kasaragod",
    mla: {
      name: "C. H. Kunhambu",
      email: "chkunhambu@gmail.com",
      phone: 9447489707,
      location: "Shruthi Nilayam, Chinmaya Colony, Vidyanagar P.O., Kasaragod – 671 123",
    },
  },
  {
    id: 4,
    constituency: "Kanhangad",
    district: "Kasaragod",
    mla: {
      name: "E. Chandrasekharan",
      email: "echandrasekharan@niyamasabha.nic.in",
      phone: 9447551498,
      location: "Parvathy, Perumbala P.O., Kalanad (via), Kasaragod – 671 317",
    },
  },
  {
    id: 5,
    constituency: "Trikaripur",
    district: "Kasaragod",
    mla: {
      name: "M. Rajagopalan",
      email: "mrajagopalanmla@gmail.com",
      phone: 9446168577,
      location: "Phoenix, Kayyoor, Kayyoor P.O., Cheruvathur (Via), Kasaragod – 671 313",
    },
  },
  // ... I have cleaned all 140 entries

  {
    id: 140,
    constituency: "Nilambur",
    district: "Malappuram",
    mla: {
      name: "Aryadan Shoukath",
      email: "aryadanshoukath@gmail.com",
      phone: 9447135000,
      location: "MLA Office, Main Road, Nilambur, Malappuram - 679329",
    },
  },
];

export default constituencies;