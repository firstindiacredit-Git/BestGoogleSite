import { useEffect, useState } from "react";
import { Card, List, Empty, Spin } from "antd";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

const Userreview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "userReviews"), orderBy("submittedAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(data);
      } catch {
        setReviews([]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
      <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 24 }}>User Reviews</h2>
      {loading ? (
        <div style={{ textAlign: "center", margin: 40 }}><Spin size="large" /></div>
      ) : reviews.length === 0 ? (
        <Empty description="No reviews submitted yet." />
      ) : (
        <List
          dataSource={reviews}
          renderItem={(review, idx) => (
            <Card key={review.id || idx} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 18 }}>{review.name}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{review.gmail}</div>
              <div style={{ marginTop: 8 }}>{review.description}</div>
              <div style={{ color: '#aaa', fontSize: 12, marginTop: 8 }}>
                {review.submittedAt ? new Date(review.submittedAt).toLocaleString() : ''}
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default Userreview;
