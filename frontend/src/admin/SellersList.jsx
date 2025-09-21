import React, {useEffect, useState} from "react";
import axios from "axios";

export default function SellersList(){
  const [sellers,setSellers] = useState([]);
  const token = localStorage.getItem("adminToken");
  useEffect(()=> {
    (async ()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/sellers?status=pending`, { headers: { Authorization: `Bearer ${token}` } });
      setSellers(res.data);
    })();
  },[]);
  const approve = async (id)=>{
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/admin/sellers/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` }});
    setSellers(s => s.filter(x=>x._id !== id));
  }
  return (
    <div>
      <h3>Pending Sellers</h3>
      {sellers.map(s => (
        <div key={s._id} style={{borderBottom:"1px solid #eee", padding:12}}>
          <strong>{s.name}</strong> — {s.email}
          <div style={{marginTop:8}}>
            <button onClick={()=>approve(s._id)}>Approve</button>
          </div>
        </div>
      ))}
      {sellers.length===0 && <div>No pending sellers</div>}
    </div>
  );
}
