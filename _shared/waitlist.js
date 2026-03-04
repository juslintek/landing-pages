function join(venture) {
  const input = document.getElementById("email");
  const msg = document.getElementById("msg");
  const email = input.value.trim();

  if (!email || !email.includes("@")) {
    msg.style.color = "#f87171";
    msg.textContent = "Please enter a valid email.";
    return;
  }

  // Store locally (no backend yet — Phase 2 connects to Worker/Airtable)
  const key = `waitlist_${venture}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  if (existing.includes(email)) {
    msg.style.color = "#888";
    msg.textContent = "You're already on the list.";
    return;
  }
  existing.push(email);
  localStorage.setItem(key, JSON.stringify(existing));

  input.value = "";
  msg.style.color = "#22c55e";
  msg.textContent = "✓ You're on the list. We'll be in touch.";
}
