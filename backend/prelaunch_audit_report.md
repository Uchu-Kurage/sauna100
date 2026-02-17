# Pre-launch Audit Findings & Final Polish Plan

I have performed a deep audit of the application's codebase to ensure a smooth and secure global launch. Below are the identified issues and the proposed fixes.

## 🚨 Critical Security Issues

### 1. Database RLS Vulnerability (Row Level Security)
- **Issue**: Current policies allow *any* logged-in user to modify or delete *any* other user's visit records (as seen in `backend/debug_fix_rls.sql`).
- **Risk**: User data loss or unauthorized manipulation.
- **Proposed Fix**: Implement ownership-based RLS policies (already drafted in `backend/production_security.sql`).

### 2. Storage Organization
- **Issue**: Photos are uploaded to a flat `visits/` folder.
- **Risk**: Harder to manage and potential (though low) for ID collisions or easier unauthorized access if IDs are leaked.
- **Proposed Fix**: Change upload paths to `users/[user_id]/saunas/[sauna_id]/[timestamp].[ext]`.

## ⚠️ UX & Logic Improvements

### 3. Guest User Handling
- **Issue**: Guest users can currently select photos and fill out visit logs, but these won't be saved to Supabase permanently.
- **Risk**: User frustration when they reload and find their "hard work" (comments/photos) gone.
- **Proposed Fix**: 
  - Show a clear "Login to Save" message in the `SaunaDetailModal`.
  - Disable the save/upload features for non-authenticated users.

### 4. Reward Trigger Edge Cases
- **Issue**: 100-sauna reward check doesn't verify if it was already triggered.
- **Risk**: Multiple celebratory animations/modals if the user saves multiple times.
- **Proposed Fix**: Add a `has_conquered_all` flag or check if the modal is already shown.

## ✅ Completed Tasks
- [x] Fixed build warning in `ProfileModal.jsx` (Import conflict).
- [x] Secured static imports for Supabase client.

---

## Next Steps
Once approved, I will implement these fixes systematically. I recommend starting with the **Strict RLS Policies** as it is the most critical for launch.
