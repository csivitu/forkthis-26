export interface FAQItemData {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItemData[] = [
  {
    id: "prerequisites",
    question: "ARE THERE ANY PRE-REQUISITES FOR THE EVENT?",
    answer:
      "The program is open to all students, regardless of their year of study or branch. Whether you're a beginner or an experienced coder, there's something for everyone.",
  },
  {
    id: "points-redeemable",
    question: "ARE THE POINTS EARNED DURING THE COURSE OF THE EVENT REDEEMABLE?",
    answer:
      "The program is open to all students, regardless of their year of study or branch. Whether you're a beginner or an experienced coder, there's something for everyone.",
  },
  {
    id: "venue-items",
    question: "WHAT DO WE NEED TO BRING TO THE VENUE?",
    answer:
      "Bring your laptop, charger, student ID, and enthusiasm to build! High-speed Wi-Fi, power extensions, and refreshments will be provided throughout the venue.",
  },
  {
    id: "attendance-reporting",
    question: "DO WE NEED TO REPORT TO THE VENUE THROUGHOUT THE THREE DAYS OF THE EVENT??",
    answer:
      "Attendance is mandatory during the opening ceremony, checkpoint validations, and the final wrap-up. Mentors and organizers will be available at the venue throughout all three days for support.",
  },
  {
    id: "point-allocation",
    question: "HOW DOES POINT ALLOCATION WORK FOR MERGED PULL REQUESTS?",
    answer:
      "Points are automatically awarded according to issue difficulty tags: Easy (10 pts), Medium (25 pts), and Hard (50 pts). Bonus points may be granted for outstanding code quality and test coverage.",
  },
  {
    id: "individual-team",
    question: "CAN I PARTICIPATE IN A TEAM OR IS IT INDIVIDUAL ONLY?",
    answer:
      "Contributions and point tracking are tied to your personal GitHub account. However, you are encouraged to brainstorm and collaborate with fellow participants during the hackathon!",
  },
];
