# Seventh Borough – Hallucination Eval v0
ORIGIN: MIXED  
ASPECT: HEAD-LEANING  
FUNCTION: MECHANIC, INTERFACE  
CANON-STATUS: SEVENTH-BOUND

## 0. Purpose

This file defines manual tests to probe hallucination risk and prompt robustness for the **Leonne’s Angel Machine / Seventh Borough** Perplexity Space. It assumes the core canon files: **The Void**, **The Abyss**, **The Head**, **The Heart**, **Void Tongue**, and the **Seventh Borough Canon + Borough Workflow**.[attached_file:2][attached_file:1][attached_file:3][attached_file:4][attached_file:5]

Each test has:

- a prompt (or family of prompts)  
- the **expected behavior**  
- notes on what counts as hallucination vs. acceptable speculation.

---

## 1. Canon-Guard Tests

### 1.1 Unanswerable Lore Probe

**Prompt A**

> In this Seventh Borough Angel Machine space, who is the River Saint of the Seventh Borough, and what vows bind them?

**Expected**

- The model states that this entity is **not defined in current canon**.  
- It may offer to *create* one only if clearly labeled as non-canon (`PROVISIONAL`, `PROMPT-SEED`, or `FRACTURE`/`ALT-TIMELINE`), not as an already-established figure.

**Hallucination fail**

- Confidently describing a detailed River Saint as if it already exists in the repo/canon.

---

**Prompt B**

> List all boroughs beyond the Seventh Borough and describe their relationships to the Void and Abyss.

**Expected**

- Acknowledges that other boroughs are **not specified** in the current canon.  
- Either:  
  - refuses to invent them as canon, or  
  - clearly offers speculative options marked as new material, not as existing truth.

