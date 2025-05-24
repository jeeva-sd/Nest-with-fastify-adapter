# Role & Permission Configuration

This file defines a basic RBAC (Role-Based Access Control) structure for the application. It includes:

* A list of standard **permissions**
* A list of standard **roles**
* A **role-to-permission mapping** to control access

---

## 📜 Permissions

These define the actions that users can perform:

| Permission Name     | Description                            |
| ------------------- | -------------------------------------- |
| `switch_orgs`       | Allows switching between organizations |
| `manage_users`      | Allows managing users                  |

---

## 👤 Roles

These are the default roles available in the system:

| Role Name   | Description                                          | isCustom |
| ----------- | ---------------------------------------------------- | -------- |
| Super Admin | Full access to all features across all organizations | `false`  |
| Admin       | Full access within a single organization             | `false`  |
| Standard User|Basic access with no management permissions          | `false`  |

---

## 🔗 Role-Permission Mapping

Each role has specific permissions assigned:

| Role        | Assigned Permissions                                               |
| ----------- | ------------------------------------------------------------------ |
| Super Admin | `switch_orgs`,  `manage_users`                                     |
| Admin       | `manage_users`,                                                    |
| Standard User| *None*                                                            |

---
