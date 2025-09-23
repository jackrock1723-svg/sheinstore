// upload example
import api from "../utils/api";

const form = new FormData();
form.append("screenshot", file);
form.append("sellerId", sellerId);
form.append("productId", productId);
form.append("price", price);
form.append("earn", earn);

const res = await api.post("/api/shipment/request", form);
// api will add Authorization header automatically
