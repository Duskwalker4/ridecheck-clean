import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://fjwxwtnwdyxlswinwoao.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqd3h3dG53ZHl4bHN3aW53b2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNTExNzksImV4cCI6MjA2NzkyNzE3OX0.tTG-wxOPuIBuSVRDpZxM3NvZoUYDxFMaD9ipyCSfqcQ"
);

let currentUser = null;

window.signUp = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return (status.innerText = error.message);
  status.innerText = "Registriert: " + JSON.stringify(data.user);
};

window.signIn = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return (status.innerText = error.message);
  currentUser = data.user;
  document.getElementById("app").style.display = "block";
  status.innerText = "Eingeloggt!";
  ladeDaten();
};

window.eintragen = async function () {
  const gewicht = +document.getElementById("gewicht").value;
  const strecke = +document.getElementById("strecke").value;
  const schwierigkeit = +document.getElementById("schwierigkeit").value;
  if (!currentUser) return;
  const { error } = await supabase.from("training").insert({
    user_id: currentUser.id,
    gewicht, strecke, schwierigkeit
  });
  if (error) return (status.innerText = error.message);
  status.innerText = "Eintrag gespeichert!";
  ladeDaten();
};

window.zielSpeichern = async function () {
  const ziel = +document.getElementById("zielgewicht").value;
  if (!currentUser) return;
  const { error } = await supabase.from("ziele").upsert({
    user_id: currentUser.id,
    zielgewicht: ziel
  });
  if (error) return (status.innerText = error.message);
  status.innerText = "Ziel gespeichert!";
};

async function ladeDaten() {
  const { data: eintraege } = await supabase.from("training").select("*");
  const { data: ziele } = await supabase.from("ziele").select("*");

  let html = "<table border='1'><tr><th>User</th><th>Gewicht</th><th>Strecke</th><th>Schwierigk.</th><th>Zielgewicht</th></tr>";
  for (let eintrag of eintraege) {
    const ziel = ziele.find(z => z.user_id === eintrag.user_id);
    html += `<tr>
      <td>${eintrag.user_id.slice(0, 5)}</td>
      <td>${eintrag.gewicht}</td>
      <td>${eintrag.strecke}</td>
      <td>${eintrag.schwierigkeit}</td>
      <td>${ziel ? ziel.zielgewicht : "-"}</td>
    </tr>`;
  }
  html += "</table>";
  document.getElementById("tabelle").innerHTML = html;
}