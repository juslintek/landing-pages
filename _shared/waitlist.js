async function join(venture) {
  const input = document.getElementById("email");
  const msg = document.getElementById("msg");
  const email = input.value.trim();

  if (!email || !email.includes("@")) {
    msg.style.color = "#f87171";
    msg.textContent = "Please enter a valid email.";
    return;
  }

  msg.style.color = "#888";
  msg.textContent = "Joining…";

  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, venture }),
    });
    const data = await res.json();

    if (data.status === "already_registered") {
      msg.style.color = "#888";
      msg.textContent = "You're already on the list.";
    } else if (data.status === "ok") {
      input.value = "";
      msg.style.color = "#22c55e";
      msg.textContent = `✓ You're #${data.position} on the list. We'll be in touch.`;
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (e) {
    // Fallback to localStorage if Worker unreachable
    const key = `waitlist_${venture}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (!existing.includes(email)) existing.push(email);
    localStorage.setItem(key, JSON.stringify(existing));
    input.value = "";
    msg.style.color = "#22c55e";
    msg.textContent = "✓ You're on the list. We'll be in touch.";
  }
}
