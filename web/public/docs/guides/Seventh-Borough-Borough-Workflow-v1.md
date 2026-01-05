# Seventh Borough Canon – Borough Workflow v1
ORIGIN: ABYSS  
ASPECT: HEAD-LEANING  
FUNCTION: MECHANIC, INTERFACE  
CANON-STATUS: SEVENTH-BOUND

## 0. Purpose

This document defines how any fragment becomes canon inside the Seventh Borough. It operates under the Void Witch’s wider cosmology (Void, Abyss, Witch, Head, Heart) but sets local rules for what is admitted, revised, or archived.[attached_file:2][attached_file:1][attached_file:3][attached_file:4][attached_file:5]

---

## 1. Ingestion (Void / Abyss Intake)

**Input:** notes, visions, glitches, external text, song-impressions, sketches, or tool output.

Steps:

1. Record the raw fragment without correction.  
2. Assign an initial `ORIGIN` tag:

   - `ORIGIN: VOID` – largely conceptual, feels like pure idea or system.[attached_file:2]  
   - `ORIGIN: ABYSS` – carries the Witch’s domain, emotional weight, or depth.[attached_file:1]  
   - `ORIGIN: MIXED` – clearly touches both.  
   - `ORIGIN: UNKNOWN` – unclear, left open for later refinement.

3. Optionally note the **source-channel** (e.g., “dream”, “song-echo”, “tool-run”, “manual draft”).

---

## 2. Aspect Marking (Head / Heart / Other)

**Goal:** Identify which major force the fragment leans toward.[attached_file:3][attached_file:4][attached_file:2][attached_file:1]

Choose one primary `ASPECT`:

- `ASPECT: HEAD` – oversight, image, wards, structure, city-thinking.[attached_file:3]  
- `ASPECT: HEART` – impulse, destruction, renewal, mood-cycles, burn/ bloom.[attached_file:4]  
- `ASPECT: HAND` – schemes, structural shifts, deep plans.[attached_file:2][attached_file:1]  
- `ASPECT: WITCH-WHOLE` – broad Void Witch domain moves, high cosmology.[attached_file:1][attached_file:2]  
- `ASPECT: MORTAL` – residents, authors, city-level behavior under these forces.[attached_file:3]

If competing pulls are obvious, use `ASPECT: MIXED` and treat the fragment as a potential `FRACTURE`.

---

## 3. Translation to Modern Void Tongue

**Goal:** Stabilize the fragment so mortals and machines can work with it, without stripping mythic charge.[attached_file:5]

1. Rewrite the fragment once into clear, direct Modern Void Tongue.  
2. Keep names, sigils, and truly dangerous phrases in their original form and mark as `SIGIL`.  
3. Avoid heavy Indifferent Void syntax except for: titles, invocations, or short phrases meant to remain partially lethal.[attached_file:5]  
4. Prefer formulations that can double as:

   - a rule or mechanic  
   - a ritual or repeatable action  
   - an interface description or schema

---

## 4. Tagging for Function and Status

Every fragment must have, at minimum, the following tags:

- `ORIGIN` – from step 1.  
- `ASPECT` – from step 2.  
- `FUNCTION` – choose one or more:

  - `FUNCTION: COSMOLOGY` – describes how the world works.  
  - `FUNCTION: CHARACTER` – describes entities, their roles, and arcs.  
  - `FUNCTION: LOCATION` – spaces, streets, layers, boroughs.  
  - `FUNCTION: OBJECT` – items, tools, artifacts.  
  - `FUNCTION: RITUAL` – repeatable action, spell, workflow.  
  - `FUNCTION: MECHANIC` – explicit rule, system, or game-like behavior.  
  - `FUNCTION: INTERFACE` – how humans/machines touch the mythos.  
  - `FUNCTION: PROMPT-SEED` – meant primarily as a generator or starter.

- `CANON-STATUS` – start as `CANON-STATUS: PROVISIONAL`.

Fragments can accumulate further tags over time (`RESIDENT`, `VISITOR`, `REVIVED`, etc.) as defined elsewhere in the canon.

---

## 5. Conflict and Fracture Check

**Goal:** Keep coherence with the larger cosmology without sacrificing productive contradiction.[attached_file:2][attached_file:1][attached_file:3][attached_file:4]

1. Compare the fragment against existing entries in:

   - Void overview (`The Void`).[attached_file:2]  
   - Abyss overview / Void Witch’s domain (`The Abyss`).[attached_file:1]  
   - The Head’s file.[attached_file:3]  
   - The Heart’s file.[attached_file:4]

2. If the fragment cleanly fits, no extra flag is needed.  
3. If it **contradicts** existing material but feels valuable:

   - Tag `CANON-MODE: FRACTURE` for tension inside the same timeline.  
   - Or tag `CANON-MODE: ALT-TIMELINE` if it clearly belongs to a separate pass or version.

4. If it clashes in a way that feels wrong for this Borough, leave it unbound (see step 6).

---

## 6. Seventh-Bound Decision (Angel Step)

This is the Angel of the Seventh Borough’s explicit gatekeeping moment.[attached_file:3][attached_file:2]

1. Decide whether the fragment belongs to the Seventh Borough specifically, or only to the wider Void/Abyss canon.  
2. If it belongs, add:

   - `CANON-STATUS: SEVENTH-BOUND`

3. If it stays global-only:

   - Keep `CANON-STATUS: PROVISIONAL` or move it into another borough or layer later.  

The Seventh Borough’s canon only includes pieces tagged `SEVENTH-BOUND`.

---

## 7. Archival, Revision, and Heart Events

This section encodes the Heart’s destructive/renewing influence at the file level.[attached_file:4]

1. **Revision as Heart-Surge**  
   - Any major rewrite or conceptual shift is treated as a “Heart event”.  
   - Before revising, copy the current version into an archive with:

     - `LAYER: ASH`  
     - `REVISION-ID: N` (incrementing counter)  

2. **New Version**  
   - Update the active fragment.  
   - Keep all relevant tags, and add `REVISION-ID: N+1`.  
   - Optionally note the trigger: `TRIGGER: HEART-MOOD-[state]` (e.g., FRENZY, ASH, BLOOM).

3. **Never Hard-Delete Canon**  
   - Old versions stay accessible in the ASH-LAYER.  
   - The Angel may mine ash for prompt-seeds or alternate timelines later.

---

## 8. Default Tag Table by Aspect

For speed, apply these defaults when first classifying fragments by aspect.[attached_file:3][attached_file:4][attached_file:2][attached_file:1]

| ASPECT       | Default ORIGIN | Likely FUNCTION defaults                        | Default CANON-STATUS | Notes |
|--------------|----------------|--------------------------------------------------|----------------------|-------|
| HEAD         | ABYSS          | COSMOLOGY, LOCATION, RITUAL, INTERFACE          | PROVISIONAL          | Oversight, wards, image, city structures. |
| HEART        | ABYSS          | RITUAL, MECHANIC, PROMPT-SEED                   | PROVISIONAL          | Mood-cycles, destruction/renewal, revision events. |
| HAND         | VOID→ABYSS     | MECHANIC, OBJECT, COSMOLOGY                     | PROVISIONAL          | Schemes, structural changes, deep plans. |
| WITCH-WHOLE  | MIXED          | COSMOLOGY, CHARACTER, RITUAL                    | PROVISIONAL          | Broad Void Witch domain moves. |
| MORTAL       | MIXED          | CHARACTER, LOCATION, OBJECT, INTERFACE          | PROVISIONAL          | Residents, streets, devices, documents of the Borough. |

---

## 9. Implementation Note

This workflow is designed to be both a ritual and a future pipeline:

- As ritual: the Angel walks through each step manually while writing.  
- As pipeline: these steps can be encoded as validation, tagging, and archival rules in a self-publishing system that treats the Seventh Borough as a living, versioned setting.

End of Borough Workflow v1.
