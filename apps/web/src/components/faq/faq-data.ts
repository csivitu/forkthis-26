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
    id: "venue-items",
    question: "WHAT DO WE NEED TO BRING TO THE VENUE?",
    answer:
      "Bring your laptop, charger, student ID, and enthusiasm to build! Wi-Fi will be provided throughout the venue.",
  },
  {
    id: "attendance-reporting",
    question: "DO WE NEED TO REPORT TO THE VENUE THROUGHOUT THE THREE DAYS OF THE EVENT??",
    answer:
      "Attendance is mandatory during the workshop. Organizers will be available at the venue during the workshop for support. However, you can attend the competition on the next two days from anywhere. ",
  },
  {
    id: "point-allocation",
    question: "HOW DOES POINT ALLOCATION WORK FOR MERGED PULL REQUESTS?",
    answer:
      "Points are automatically awarded according to issue difficulty tags: Easy, Medium and Hard. Bonus points may be granted for outstanding code quality and test coverage.",
  },
  {
    id: "individual-team",
    question: "CAN I PARTICIPATE IN A TEAM OR IS IT INDIVIDUAL ONLY?",
    answer:
      "The event is for individual participation. Contributions and point tracking are tied to your personal GitHub account.",
  },
];
