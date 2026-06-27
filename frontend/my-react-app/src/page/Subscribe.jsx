import { useState } from "react";
import "./Subscribe.css";

function Subscribe() {

  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {

    return new Promise((resolve) => {

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);

    });

  };

  const handlePayment = async () => {

    setLoading(true);

    const loaded =
      await loadRazorpay();

    if (!loaded) {

      alert("Razorpay Failed To Load");

      setLoading(false);

      return;

    }

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/subcriptions/creat-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " + token,
          },
        }
      );

      const data =
        await res.json();

      if (!data.success) {

        alert("Order Creation Failed");

        setLoading(false);

        return;

      }

      const options = {

        key:
          "rzp_test_T5VFQa9o4rQ8Wp",

        amount:
          data.order.amount,

        currency:
          data.order.currency,

        name:
          "Hacking Labs",

        description:
          "Monthly Subscription",

        order_id:
          data.order.id,

        handler:
          async function (response) {

            try {

              const verifyRes =
                await fetch(
                  "http://localhost:3000/subcriptions/verify-payment",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization:
                        "Bearer " + token,
                    },

                    body: JSON.stringify({

                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,

                    }),
                  }
                );

              const verifyData =
                await verifyRes.json();

              if (
                verifyData.success
              ) {

                alert(
                  "Subscription Activated Successfully"
                );

                window.location.href =
                  "/labs";

              } else {

                alert(
                  verifyData.message
                );

              }

            } catch (err) {

              console.log(err);

              alert(
                "Payment Verification Failed"
              );

            }

          },

        prefill: {
          name: "",
          email: "",
        },

        theme: {
          color: "#00ff88",
        },
      };

      const paymentObject =
        new window.Razorpay(
          options
        );

      paymentObject.open();

    } catch (err) {

      console.log(err);

      alert("Server Error");

    }

    setLoading(false);

  };

  return (

    <div className="subscribe-page">

      <div className="subscribe-card">

        <h1>
          Premium Subscription
        </h1>

        <p>
          Access All Premium Labs
        </p>

        <div className="price">

          ₹499

          <span>
            /month
          </span>

        </div>

        <ul>

          <li>
            Unlimited Pivoting Labs
          </li>

          <li>
            Premium Machines
          </li>

          <li>
            Future Labs Included
          </li>

          <li>
            Priority Support
          </li>

        </ul>

        <button
          onClick={handlePayment}
          disabled={loading}
        >

          {
            loading
              ? "Loading..."
              : "Subscribe Now"
          }

        </button>

      </div>

    </div>

  );

}

export default Subscribe;