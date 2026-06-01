const burger = document.querySelector(".burger");
const links = document.querySelector(".links");
burger?.addEventListener("click", () => links.classList.toggle("open"));
document
  .querySelectorAll('a[href^="#"]')
  .forEach((a) =>
    a.addEventListener("click", () => links?.classList.remove("open")),
  );
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("show");
    }),
  { threshold: 0.12 },
);
document.querySelectorAll(".fade").forEach((el) => io.observe(el));
const q = document.querySelector("#docSearch");
const docs = [...document.querySelectorAll(".doc")];
q?.addEventListener("input", () => {
  const v = q.value.toLowerCase().trim();
  docs.forEach((d) => {
    d.style.display = d.textContent.toLowerCase().includes(v) ? "flex" : "none";
  });
});
