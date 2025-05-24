### **GET** `/roles/view`

**Description:**
Retrieves role details by role ID.

**Request Payload:**

* `roleId` (string, **required**): The ID of the role. Must be a valid.
* `includePermissions` (boolean, optional, default: `false`): If `true`, includes a list of permission names assigned to the role.

**Notes:**

* If `includePermissions` is omitted or set to `false`, the `permissions` field will not be included in the response.
* If the role is not found, a `404 Role not found` error is returned.

---

### **GET** `/roles`

**Description:**
Retrieves a list of role.

**Payload:**

```ts
{
  page?: number;                // default: 1, min: 1
  limit?: number;              // default: 5, min: 1, max: 100
  searchTerm?: string;         // optional, max: 20 chars
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includePermissions?: boolean | 'true' | 'false'; // default: false
}
```

**Notes:**

* Returns a paginated list of roles.
* If `includePermissions` is true, role permissions are included.
* Supports filtering by name via `searchTerm` and basic sorting.

---

### **POST** `/roles`

**Description:** Endpoint to create new role.

**Permission:** `superAdminOnly`

**Payload:**

```json
{
  "name": "string",                      // required
  "description": "string (optional)",    // optional, max 255 characters
  "permissions": ["permission"]          // optional, defaults to []
}
```

**Notes:**

* Role name must be unique.
* If any permission are invalid, the request will fail.
* `isCustom` is automatically set to `true` for newly created created roles.

---

### **PATCH** `/roles`

**Description:** Endpoint to update role.

**Permission:** `superAdminOnly`

**Payload:**

```json
{
  "roleId": "string",                   // required, CUID
  "name": "string (optional)",          // optional, must be unique if provided
  "description": "string (optional)",   // optional
  "permissions": ["permission.name"]    // optional, defaults to []
}
```

**Notes:**

* Only custom roles can be updated.
* If `name` is changed, it must remain unique.
* All previous permissions are replaced if `permissions` are provided.
* Invalid permission names will cause the request to fail.

---

### **DELETE** `/roles`

**Description:** Endpoint to delete a role.

**Permission:** `superAdminOnly`

**Payload:**

```json
{
  "roleId": "string" // required, CUID
}
```

**Notes:**

* Only **custom roles** can be deleted.
* Deletion fails if **any users are associated** with the role.

---

### **GET** `/roles/permissions`

**Description:** Retrieves all permission.

**Payload:** *None*

**Returns:**
An alphabetically sorted list of all available permissions.

---
