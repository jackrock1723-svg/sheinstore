import React, {useEffect, useState} from "react";
import axios from "axios";
export default function WithdrawalsList(){
  const [items,setItems] = useState([]);
  const token = localStorage.getItem("adminToken");
  useEffect(()=> {
    (async ()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/withdrawals`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data);
    })();
  },[]);
  const act = async (id, action) => {
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/withdrawals/${id}`, { action }, { headers: { Authorization: `Bearer ${token}` } });
    setItems(i => i.filter(x=>x._id !== id));
  };
  return (
    <div>
      <h3>Withdrawals (pending)</h3>
      {items.map(w => (
        <div key={w._id} style={{padding:12, borderBottom:"1px solid #eee"}}>
          <div>Seller: {w.sellerId} • ₹{w.amount}</div>
          <div style={{marginTop:8}}>
            <button onClick={()=>act(w._id, "approve")}>Approve</button>
            <button onClick={()=>act(w._id, "reject")} style={{marginLeft:8}}>Reject</button>
          </div>
        </div>
      ))}
      {items.length===0 && <div>No pending withdrawals</div>}
    </div>
  )
}
