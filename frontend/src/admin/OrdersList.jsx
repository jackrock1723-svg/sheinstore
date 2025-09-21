import React, {useEffect, useState} from "react";
import axios from "axios";
export default function OrdersList(){
  const [orders,setOrders] = useState([]);
  const token = localStorage.getItem("adminToken");
  useEffect(()=> {
    (async ()=>{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    })();
  },[]);
  const verify = async (id)=>{
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/orders/${id}/verify`, { action: "verify" }, { headers: { Authorization: `Bearer ${token}` }});
    setOrders(o => o.map(x => x._id===id ? ({...x, status:"shipped"}) : x));
  };
  return (
    <div>
      <h3>Orders</h3>
      {orders.map(o=> (
        <div key={o._id} style={{padding:12, borderBottom:"1px solid #eee"}}>
          <div>{o.productTitle} — ₹{o.price} — {o.status}</div>
          <div style={{marginTop:8}}>
            {o.status==="payment_pending" && <button onClick={()=>verify(o._id)}>Verify</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
