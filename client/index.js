var loading = document.getElementById("loading");
var warning = document.getElementById("warning");

fetch("/api/orders")
  .then((res) => res.json())
  .then((order) => {
    warning.classList.add("hidden");

    var idealForm = document.getElementById("ideal-form");

    idealForm.addEventListener("submit", (e) => {
      e.preventDefault();

      loading.classList.remove("hidden");

      // Confirm the order
      fetch(`/api/orders/${order.id}/confirm-payment-source`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_source: {
            ideal: {
              country_code: "NL", // iDeal payment method only available in the Netherlands
              name: `${document.getElementById("firstName").value} ${document.getElementById("lastName").value}`,
              bic: document.getElementById("bic").value,
            },
          },
        }),
      })
        .then((res) => res.json())
        .then(({ redirectUrl }) => {
          loading.classList.remove("hidden");
          window.location.href = redirectUrl;
        })
        .catch((err) => {
          console.error(err)
          loading.classList.add("hidden");
          warning.classList.remove("hidden");
        });
    });
  })
  .catch((err) => {
    console.error(err)
    warning.classList.remove("hidden");
  });
