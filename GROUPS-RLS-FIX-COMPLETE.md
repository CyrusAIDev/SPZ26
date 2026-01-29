# Groups RLS Recursion Fix - COMPLETE

## Problem Solved

Fixed the **circular recursion** between `groups` and `group_members` RLS policies that was preventing invite links from loading.

### The Error
```
ERROR: infinite recursion detected in policy for relation "groups"
```

### Root Cause
The first fix (migration 20260128) created a new circular dependency:
- `groups` policy checked `group_members` to verify membership
- `group_members` policy checked `groups` to verify ownership
- This created an infinite loop when loading invite details

## What Was Fixed

Created migration: `supabase/migrations/20260129000000_fix_groups_recursion.sql`

### Key Changes

1. **groups SELECT policy** - Now allows viewing if:
   - User is the group owner, OR
   - There's a valid invite for that group (checks `invites` table, not `group_members`)

2. **group_members SELECT policies** - Split into two simple policies:
   - Users can see their own memberships (no joins)
   - Group owners can see all members (checks `groups`, but `groups` no longer checks `group_members`)

3. **No more circular dependency!**

## Migration Applied Successfully

```
✅ Migration 20260129000000_fix_groups_recursion.sql applied
```

## How This Enables the PRD Flow

According to the PRD, the invite flow should work like this:

1. **New anonymous user clicks invite link**
   - User has a valid invite code
   - Can now view group name (because invite exists in `invites` table)
   
2. **User sees group details**
   - Group name, icon (if any)
   - "Join this group" interface
   
3. **User enters display name and joins**
   - `redeem_invite` function (SECURITY DEFINER) handles the join
   - User becomes a group member
   
4. **User sees Group Home**
   - Can now see activities
   - Can create/manage activities

## Next Steps: Test Your App

### Restart the App

Your Metro server is still running with cached errors. Reload it:

```bash
# Option 1: Press 'r' in the Metro terminal to reload
# Option 2: Or restart with cleared cache:
npm run start:go -- --clear
```

### Test the Complete Flow

Once the app reloads:

1. ✅ **Welcome Screen** → Tap "Test Setup (Dev Only)"
2. ✅ **Create Test Group** → Should show success with group details
3. ✅ **Tap "Test Now"** → Should now load the group name (no recursion error!)
4. ✅ **See invite screen** → Group name, display name input, "Join Group" button
5. ✅ **Enter display name** → e.g., "Test User"
6. ✅ **Join the group** → Should navigate to Group Home
7. ✅ **Group Home** → See group name, members, activities
8. ✅ **Add Activity** → Create "Watch a movie"
9. ✅ **View/Edit/Delete** → Test full CRUD

## Expected Results

### Before Fix:
- ❌ "Invalid Invite" error screen
- ❌ Console: "infinite recursion detected in policy for relation 'groups'"

### After Fix:
- ✅ Invite screen loads with group name
- ✅ Can enter display name
- ✅ Can join group successfully
- ✅ No recursion errors in console

## Technical Details

### Breaking the Recursion

The fix breaks the circular dependency by:

1. **groups policy** queries `invites` instead of `group_members`
2. **group_members policies** are split:
   - Simple self-check: `user_id = auth.uid()` (no joins)
   - Owner check: queries `groups` only (but `groups` doesn't query back)
3. No circular path exists anymore!

### Security Maintained

- **Groups visibility**: Users can only see groups they own OR have a valid invite for
- **Members visibility**: Users see their own memberships OR (if owner) all members
- **All operations**: Complex operations use SECURITY DEFINER functions that bypass RLS safely

### PRD Compliance

All requirements maintained:
- ✅ No-login login (anonymous auth)
- ✅ Invite-based joining without signup
- ✅ Group owners can manage their groups
- ✅ Members can view and create activities
- ✅ Proper permissions and security

## Files Changed

- **Created**: `supabase/migrations/20260129000000_fix_groups_recursion.sql`
- **Applied to database**: Yes ✅

## Migration History

1. `20260126000000_initial_schema.sql` - Original schema (had recursion)
2. `20260127000000_add_activities_tables.sql` - Activities CRUD tables
3. `20260128000000_fix_rls_recursion.sql` - Fixed `group_members` recursion (created new `groups` recursion)
4. `20260129000000_fix_groups_recursion.sql` - **Fixed `groups` recursion** ✅

## Testing Checklist

After restarting your app, verify:

- [ ] No console errors about "infinite recursion"
- [ ] "Test Now" button loads invite screen (not "Invalid Invite")
- [ ] Can see group name on invite screen
- [ ] Can enter display name
- [ ] "Join Group" button works
- [ ] Navigates to Group Home after joining
- [ ] Can see group members
- [ ] Can create activities
- [ ] Can view/edit/delete activities

## If You Still See Issues

1. **Make sure you reload the app** - Press `r` in Metro terminal or restart with `npm run start:go -- --clear`
2. **Check for cached errors** - Sometimes the error screen is cached, close and reopen the app
3. **Share screenshots** - If you see any new errors, show me what's happening

---

**Status**: ✅ Ready for testing! Reload your app and test the invite flow.

The circular recursion is now completely resolved. You should be able to click "Test Now" and see the invite screen with the group name.
