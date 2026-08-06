/**
 * Interactieve demo's op de marketingsite.
 *
 *  1. Het dagbord  — groepen als kolommen, kinderen als kaartjes, en de
 *     beroepskracht-kindratio die live meerekent. De uitkomsten komen uit
 *     window.BKR_TABLE, gegenereerd met dezelfde BKRCalculator die de
 *     Scheduling-service gebruikt (zie bkr-table.js).
 *  2. Planningsregels — bouw een weekpatroon op zoals in het echte
 *     "Planning toevoegen"-dialoog, en zie het weekraster meelopen.
 *
 * Alle data hieronder is demodata. Er gaat niets naar een server.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- data */

  var DAYS = [
    { key: "ma", short: "Ma", label: "maandag", date: "9 maart 2026" },
    { key: "di", short: "Di", label: "dinsdag", date: "10 maart 2026" },
    { key: "wo", short: "Wo", label: "woensdag", date: "11 maart 2026" },
    { key: "do", short: "Do", label: "donderdag", date: "12 maart 2026" },
    { key: "vr", short: "Vr", label: "vrijdag", date: "13 maart 2026" },
  ];

  var SLOTS = {
    heledag: { name: "Hele dag", time: "07:30–18:30", color: "var(--teal)" },
    ochtend: { name: "Ochtend", time: "07:30–13:00", color: "var(--zon)" },
    middag: { name: "Middag", time: "13:00–18:30", color: "var(--steen)" },
  };

  /**
   * Demogroepen. `age` is de leeftijd in hele jaren op de demoweek en bepaalt
   * in welke BKR-emmer een kind valt. De weekpatronen zijn zo gekozen dat de
   * week alle uitkomsten van de rekenregels laat zien:
   *   wo Zonnetjes  → bepaald door de leeftijdsratio's
   *   wo Sterretjes → vangnetregel
   *   do Zonnetjes  → drie begeleiders
   *   de rest       → groepsgrootteminimum
   */
  var GROUPS = [
    {
      id: "zon",
      name: "Zonnetjes",
      ages: "0–2 jaar",
      color: "#1976D2",
      children: [
        { name: "Noor Bakker", age: 0, days: { ma: "heledag", di: "heledag", wo: "ochtend", do: "heledag", vr: "ochtend" } },
        { name: "Liam de Vries", age: 0, days: { ma: "ochtend", di: "heledag", do: "heledag" } },
        { name: "Fleur Hoekstra", age: 0, days: { ma: "heledag", di: "heledag", wo: "heledag", do: "ochtend" } },
        { name: "Kaan Arslan", age: 0, days: { di: "heledag", wo: "heledag", do: "heledag" } },
        { name: "Sara Yılmaz", age: 1, days: { ma: "heledag", di: "heledag", do: "middag", vr: "heledag" } },
        { name: "Mees Jansen", age: 1, days: { ma: "heledag", di: "heledag", do: "heledag", vr: "heledag" } },
        { name: "Elif Demir", age: 1, days: { ma: "middag", do: "heledag", vr: "heledag" } },
        { name: "Tycho Wolters", age: 1, days: { ma: "heledag", di: "ochtend", wo: "heledag", do: "heledag", vr: "heledag" } },
        { name: "Nina Sanders", age: 1, days: { do: "heledag", vr: "ochtend" } },
      ],
    },
    {
      id: "ster",
      name: "Sterretjes",
      ages: "1–3 jaar",
      color: "#388E3C",
      children: [
        { name: "Tess Visser", age: 1, days: { ma: "heledag", di: "heledag", wo: "heledag", do: "heledag", vr: "ochtend" } },
        { name: "Amira Haddad", age: 1, days: { ma: "heledag", di: "heledag", wo: "heledag", do: "ochtend" } },
        { name: "Lieke Verbeek", age: 1, days: { ma: "heledag", di: "heledag", wo: "heledag", do: "heledag", vr: "heledag" } },
        { name: "Omar Benali", age: 1, days: { ma: "heledag", di: "ochtend", wo: "heledag", do: "heledag", vr: "heledag" } },
        { name: "Roos Kuipers", age: 1, days: { ma: "heledag", wo: "heledag", do: "heledag", vr: "ochtend" } },
        { name: "Thijs Molenaar", age: 1, days: { ma: "heledag", di: "heledag", wo: "ochtend", vr: "heledag" } },
        { name: "Youssef Aydın", age: 2, days: { ma: "heledag", di: "ochtend", do: "heledag" } },
        { name: "Lotte Smit", age: 2, days: { ma: "ochtend", do: "heledag", vr: "heledag" } },
        { name: "Bram Koster", age: 2, days: { di: "heledag", do: "middag", vr: "heledag" } },
        { name: "Jesse Mulder", age: 2, days: { ma: "middag", do: "heledag" } },
        { name: "Vera Nijhuis", age: 2, days: { di: "heledag", vr: "heledag" } },
        { name: "Sofia Rossi", age: 3, days: { ma: "heledag", di: "heledag", wo: "heledag", do: "heledag", vr: "heledag" } },
      ],
    },
    {
      id: "regen",
      name: "Regenboog",
      ages: "2–4 jaar",
      color: "#7B1FA2",
      children: [
        { name: "Zeynep Kaya", age: 2, days: { ma: "ochtend", di: "heledag", wo: "heledag", do: "middag" } },
        { name: "Julia Hendriks", age: 2, days: { ma: "heledag", wo: "middag", do: "heledag", vr: "heledag" } },
        { name: "Cato Blom", age: 2, days: { ma: "heledag", di: "heledag", wo: "heledag", do: "heledag" } },
        { name: "Maud Slegers", age: 2, days: { ma: "ochtend", di: "heledag", wo: "heledag", vr: "heledag" } },
        { name: "Lars Veenstra", age: 2, days: { ma: "heledag", di: "heledag", do: "heledag", vr: "ochtend" } },
        { name: "Fenna Bos", age: 3, days: { ma: "heledag", di: "heledag", wo: "ochtend", do: "heledag", vr: "heledag" } },
        { name: "Daan Peeters", age: 3, days: { ma: "heledag", di: "ochtend", do: "heledag", vr: "heledag" } },
        { name: "Otto Willems", age: 3, days: { di: "heledag", wo: "heledag", do: "heledag", vr: "ochtend" } },
        { name: "Sem van Dijk", age: 3, days: { ma: "heledag", di: "heledag", do: "ochtend", vr: "heledag" } },
        { name: "Ravi Chowdhury", age: 3, days: { ma: "heledag", wo: "heledag", do: "heledag", vr: "heledag" } },
        { name: "Bo Timmermans", age: 3, days: { di: "heledag", wo: "heledag", do: "heledag", vr: "heledag" } },
        { name: "Iris Groen", age: 3, days: { ma: "heledag", di: "ochtend", wo: "heledag", do: "heledag" } },
      ],
    },
  ];

  // Wachtlijst voor "Kind inplannen": voegt druk toe op de ratio.
  var WAITLIST = [
    { name: "Nora Fischer", age: 0 },
    { name: "Luca Moretti", age: 1 },
    { name: "Ayla Öztürk", age: 0 },
    { name: "Fedde Terpstra", age: 2 },
    { name: "Isa Verhoeven", age: 1 },
    { name: "Milan Brouwer", age: 3 },
  ];

  var BASIS_TEXT = {
    g: "Bepaald door het groepsgrootteminimum.",
    r: "Bepaald door de leeftijdsratio’s van deze groep.",
    s: "Vangnetregel: met één kind minder zouden de regels méér begeleiders vragen, dus komt er één extra bij.",
    n: "Geen geldige BKR voor deze samenstelling — de groep is te groot voor deze leeftijden.",
  };

  /* --------------------------------------------------------------- state */

  // Woensdag staat vooraan: dan laat het bord de vangnetregel én een
  // leeftijdsratio-uitkomst tegelijk zien.
  var state = {
    day: "wo",
    absent: Object.create(null), // "groupId:childName" -> true
    extra: Object.create(null), // groupId -> [child, ...]
    waitIndex: 0,
  };

  /* ------------------------------------------------------------- helpers */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function absentKey(groupId, name) {
    return groupId + ":" + name;
  }

  /** Alle kinderen van een groep die op deze dag ingepland staan. */
  function scheduledFor(group, dayKey) {
    var own = group.children.filter(function (c) {
      return Boolean(c.days[dayKey]);
    });
    var added = (state.extra[group.id] || []).map(function (c) {
      // Bijgeplande kinderen komen elke dag hele dagen.
      return { name: c.name, age: c.age, days: null, added: true };
    });
    return own.concat(added);
  }

  function slotFor(child, dayKey) {
    return child.added ? "heledag" : child.days[dayKey];
  }

  /**
   * Zoek het BKR-resultaat op voor een groepssamenstelling.
   * Buiten het bereik van de tabel bestaat er geen geldige ratio meer.
   */
  function lookupBkr(children) {
    var b = [0, 0, 0, 0];
    for (var i = 0; i < children.length; i++) {
      var a = children[i].age;
      if (a >= 0 && a <= 3) b[a] += 1;
    }
    var row = window.BKR_TABLE && window.BKR_TABLE[b.join("")];
    if (!row) return { ok: false, professionals: 0, basis: "n", total: children.length };
    return {
      ok: row[0] === 1,
      professionals: row[1],
      basis: row[2],
      maxChildren: row[3],
      total: children.length,
    };
  }

  /* ----------------------------------------------------------- dagbord */

  var boardRoot = document.querySelector("[data-board]");

  function renderBoard(changedGroupId) {
    if (!boardRoot) return;

    var cols = boardRoot.querySelector("[data-board-cols]");
    var dateOut = boardRoot.querySelector("[data-board-date]");
    var day = DAYS.filter(function (d) {
      return d.key === state.day;
    })[0];

    if (dateOut) dateOut.textContent = day.label + " " + day.date;
    cols.style.setProperty("--cols", String(GROUPS.length));
    cols.textContent = "";

    GROUPS.forEach(function (group) {
      var kids = scheduledFor(group, state.day);
      var present = kids.filter(function (c) {
        return !state.absent[absentKey(group.id, c.name)];
      });
      var bkr = lookupBkr(present);

      var col = el("div", "group-col");

      /* kop */
      var head = el("div", "group-col__head");
      var name = el("div", "group-col__name");
      var dot = el("span", "group-col__dot");
      dot.style.background = group.color;
      name.appendChild(dot);
      name.appendChild(document.createTextNode(group.name));
      head.appendChild(name);
      var absentCount = kids.length - present.length;
      head.appendChild(
        el(
          "div",
          "group-col__meta",
          group.ages +
            " · " +
            present.length +
            (present.length === 1 ? " kind" : " kinderen") +
            (absentCount ? " · " + absentCount + " afwezig" : "")
        )
      );
      col.appendChild(head);

      /* BKR */
      var stateName = !bkr.ok ? "fail" : bkr.basis === "s" ? "safeguard" : "ok";
      var bkrBox = el("div", "bkr");
      bkrBox.setAttribute("data-state", stateName);
      bkrBox.setAttribute("role", "status");

      var fig = el("div", "bkr__figure");
      fig.appendChild(el("span", "bkr__count", bkr.ok ? String(bkr.professionals) : "—"));
      fig.appendChild(
        el(
          "span",
          "bkr__unit",
          bkr.ok
            ? bkr.professionals === 1
              ? "begeleider nodig"
              : "begeleiders nodig"
            : "niet haalbaar"
        )
      );
      bkrBox.appendChild(fig);

      var why = present.length === 0
        ? "Geen kinderen ingepland, dus er zijn geen begeleiders nodig."
        : BASIS_TEXT[bkr.basis];
      bkrBox.appendChild(el("p", "bkr__why", why));
      col.appendChild(bkrBox);

      if (changedGroupId === group.id) {
        bkrBox.classList.add("bkr--pulse");
      }

      /* kinderen */
      var list = el("ul", "kids");
      if (kids.length === 0) {
        var none = el("li");
        none.appendChild(el("div", "board__hint", "Niemand ingepland op " + day.label + "."));
        list.appendChild(none);
      }

      kids.forEach(function (child) {
        var key = absentKey(group.id, child.name);
        var isAbsent = Boolean(state.absent[key]);
        var slot = SLOTS[slotFor(child, state.day)];

        var li = el("li");
        var btn = el("button", "kid" + (child.added ? " kid--enter" : ""));
        btn.type = "button";
        btn.setAttribute("aria-pressed", isAbsent ? "true" : "false");
        btn.setAttribute(
          "aria-label",
          child.name +
            ", " +
            slot.name +
            " " +
            slot.time +
            (isAbsent ? ". Nu afwezig gemeld. Activeer om weer aanwezig te melden." : ". Activeer om afwezig te melden.")
        );

        var bar = el("span", "kid__slot");
        bar.style.background = slot.color;
        btn.appendChild(bar);
        btn.appendChild(el("span", "kid__name", child.name));
        btn.appendChild(el("span", "kid__age", child.age + "j"));

        btn.addEventListener("click", function () {
          if (state.absent[key]) delete state.absent[key];
          else state.absent[key] = true;
          renderBoard(group.id);
        });

        li.appendChild(btn);
        list.appendChild(li);
      });
      col.appendChild(list);

      /* bijplannen */
      var add = el("button", "col-add");
      add.type = "button";
      var next = WAITLIST[state.waitIndex % WAITLIST.length];
      add.textContent = "+ Kind inplannen";
      add.setAttribute("aria-label", "Plan " + next.name + " (" + next.age + " jaar) in bij " + group.name);
      add.addEventListener("click", function () {
        var pick = WAITLIST[state.waitIndex % WAITLIST.length];
        state.waitIndex += 1;
        if (!state.extra[group.id]) state.extra[group.id] = [];
        state.extra[group.id].push({ name: pick.name, age: pick.age });
        renderBoard(group.id);
      });
      col.appendChild(add);

      cols.appendChild(col);
    });
  }

  if (boardRoot) {
    boardRoot.querySelectorAll("[data-day]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.day = btn.getAttribute("data-day");
        boardRoot.querySelectorAll("[data-day]").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        renderBoard();
      });
    });

    var reset = boardRoot.querySelector("[data-board-reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        state.absent = Object.create(null);
        state.extra = Object.create(null);
        state.waitIndex = 0;
        renderBoard();
      });
    }

    renderBoard();
  }

  /* -------------------------------------------------- planningsregels */

  var planRoot = document.querySelector("[data-planner]");

  if (planRoot) {
    // Begin met een gevulde planning: drie dagdelen bij Sterretjes, zoals een
    // gemiddeld contract. Zo is direct te zien wat regels opleveren.
    var rules = [
      { day: "ma", slot: "heledag", group: "ster" },
      { day: "wo", slot: "ochtend", group: "ster" },
      { day: "do", slot: "heledag", group: "ster" },
    ];
    var daySel = planRoot.querySelector("[data-plan-day]");
    var slotSel = planRoot.querySelector("[data-plan-slot]");
    var groupSel = planRoot.querySelector("[data-plan-group]");
    var addBtn = planRoot.querySelector("[data-plan-add]");
    var listOut = planRoot.querySelector("[data-plan-rules]");
    var gridOut = planRoot.querySelector("[data-plan-grid]");
    var msgOut = planRoot.querySelector("[data-plan-msg]");

    // De dag bestaat uit twee dagdelen. Een hele-dagregel vult ze allebei —
    // daarom is "hele dag" hier geen aparte rij.
    var SLOT_ORDER = [
      { key: "ochtend", label: "Ochtend", time: "07:30–13:00" },
      { key: "middag", label: "Middag", time: "13:00–18:30" },
    ];

    function renderPlanner() {
      /* regels */
      listOut.textContent = "";
      if (rules.length === 0) {
        var empty = el(
          "div",
          "empty",
          "Nog geen regels. Kies een dag, tijdslot en groep en voeg de eerste regel toe."
        );
        listOut.appendChild(empty);
      } else {
        var ul = el("ul", "rules");
        rules.forEach(function (r, i) {
          var day = DAYS.filter(function (d) {
            return d.key === r.day;
          })[0];
          var group = GROUPS.filter(function (g) {
            return g.id === r.group;
          })[0];

          var li = el("li", "rule");
          li.appendChild(el("span", "rule__day", day.short));
          li.appendChild(
            document.createTextNode(SLOTS[r.slot].name + " · " + group.name)
          );
          var del = el("button", "rule__del", "Verwijderen");
          del.type = "button";
          del.setAttribute(
            "aria-label",
            "Verwijder regel " + day.label + ", " + SLOTS[r.slot].name + ", " + group.name
          );
          del.addEventListener("click", function () {
            rules.splice(i, 1);
            renderPlanner();
          });
          li.appendChild(del);
          ul.appendChild(li);
        });
        listOut.appendChild(ul);
      }

      /* weekraster */
      gridOut.textContent = "";
      gridOut.appendChild(el("div", "week__h", ""));
      DAYS.forEach(function (d) {
        gridOut.appendChild(el("div", "week__h", d.short));
      });

      SLOT_ORDER.forEach(function (slot) {
        var rh = el("div", "week__rh");
        rh.appendChild(el("span", null, slot.label));
        rh.appendChild(el("small", null, slot.time));
        gridOut.appendChild(rh);

        DAYS.forEach(function (d) {
          var hit = rules.filter(function (r) {
            return r.day === d.key && (r.slot === slot.key || r.slot === "heledag");
          })[0];
          var cell = el("div", "week__cell");
          cell.setAttribute("data-on", hit ? "true" : "false");
          if (hit) {
            var g = GROUPS.filter(function (x) {
              return x.id === hit.group;
            })[0];
            // Kleur per groep, gelijk aan de stip op het dagbord.
            cell.style.background = g.color;
            cell.setAttribute("title", d.label + " · " + slot.label + " · " + g.name);
          }
          gridOut.appendChild(cell);
        });
      });

      var dagdelen = rules.reduce(function (n, r) {
        return n + (r.slot === "heledag" ? 2 : 1);
      }, 0);
      msgOut.textContent =
        rules.length === 0
          ? "Een planning geldt vanaf een startdatum en herhaalt zich wekelijks."
          : rules.length +
            (rules.length === 1 ? " regel" : " regels") +
            " · " +
            dagdelen +
            (dagdelen === 1 ? " dagdeel" : " dagdelen") +
            " per week, wekelijks herhaald vanaf de startdatum.";
    }

    addBtn.addEventListener("click", function () {
      var day = daySel.value;
      var slot = slotSel.value;
      var group = groupSel.value;

      // Zelfde dag + tijdslot + groep mag maar één keer voorkomen — net als in de app.
      var dup = rules.some(function (r) {
        return r.day === day && r.slot === slot && r.group === group;
      });
      if (dup) {
        msgOut.textContent =
          "Dezelfde combinatie van dag, tijdslot en groep mag maar één keer in een planning voorkomen.";
        return;
      }
      rules.push({ day: day, slot: slot, group: group });
      renderPlanner();
    });

    renderPlanner();
  }
})();
