/** What a Firestore Timestamp field reads back as, from either SDK: an object with toDate(). */
export const timestamp = (date: Date) => ({ toDate: () => date });
