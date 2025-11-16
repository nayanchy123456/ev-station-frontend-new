import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import "../../../../css/hostsManagement.css";

const HostsManagement = () => {
  const [pendingHosts, setPendingHosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingHosts();
  }, []);

  const fetchPendingHosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pending-hosts");
      setPendingHosts(res.data);
    } catch (error) {
      console.error("Failed to fetch pending hosts:", error);
      setPendingHosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (host) => {
    try {
      const res = await api.put(`/admin/approve-host/${host.userId}`);
      alert(res.data.message);
      fetchPendingHosts();
    } catch (error) {
      console.error(error);
      alert("Failed to approve host.");
    }
  };

  const handleReject = async (host) => {
    try {
      const res = await api.delete(`/admin/reject-host/${host.userId}`);
      alert(res.data.message);
      fetchPendingHosts();
    } catch (error) {
      console.error(error);
      alert("Failed to reject host.");
    }
  };

  if (loading) {
    return <p className="status-message">Loading pending hosts...</p>;
  }

  if (pendingHosts.length === 0) {
    return <p className="status-message">No pending hosts at the moment.</p>;
  }

  return (
    <div className="hosts-management-container">
      <h2>Pending Hosts</h2>
      <div className="hosts-grid">
        {pendingHosts.map((host) => (
          <div className="host-card" key={host.userId}>
            <h3>
              {host.firstName} {host.lastName}
            </h3>
            <p><strong>Email:</strong> {host.email}</p>
            <p><strong>Phone:</strong> {host.phone}</p>
            <div className="host-card-actions">
              <button
                className="approve-btn"
                onClick={() => handleApprove(host)}
              >
                ✅ Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(host)}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostsManagement;
