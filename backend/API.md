# JP Notes API

Base URL: `http://localhost:4000/api`

---

## Notes

### GET /notes

List all notes. Ordered by pinned (desc) then updated (desc).

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `folderId` | string | Filter by folder ID |
| `tag` | string | Filter by tag name |
| `search` | string | Full-text search in title and content |

**Response** `200`
```json
[
  {
    "id": "cuid",
    "title": "string",
    "content": "string",
    "pinned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null,
    "folderId": "cuid | null",
    "folder": { "id": "cuid", "name": "string", "parentId": "cuid | null" },
    "tags": [{ "id": "cuid", "name": "string" }]
  }
]
```

---

### GET /notes/:id

**Response** `200` — note object (same shape as above)

**Response** `404`
```json
{ "error": "Note not found" }
```

---

### POST /notes

**Body**
```json
{
  "title": "string",
  "content": "string",
  "folderId": "cuid (optional)",
  "tags": ["tag-name"]
}
```

Tags are created automatically if they don't exist.

**Response** `201` — created note object

---

### PUT /notes/:id

All fields optional. Setting `folderId: null` disconnects the note from its folder. Providing `tags` replaces all existing tags.

**Body**
```json
{
  "title": "string",
  "content": "string",
  "folderId": "cuid | null",
  "tags": ["tag-name"],
  "pinned": true
}
```

**Response** `200` — updated note object

**Response** `404`
```json
{ "error": "Note not found" }
```

---

### DELETE /notes/:id

**Response** `204` — no body

---

## Folders

### GET /folders

**Response** `200` — array of folders, sorted alphabetically by name
```json
[
  {
    "id": "cuid",
    "name": "string",
    "parentId": "cuid | null"
  }
]
```

---

### GET /folders/:id

**Response** `200` — folder object

**Response** `404`
```json
{ "error": "Folder not found" }
```

---

### POST /folders

**Body**
```json
{
  "name": "string",
  "parentId": "cuid (optional)"
}
```

**Response** `201` — created folder object

---

### PUT /folders/:id

**Body**
```json
{
  "name": "string",
  "parentId": "cuid"
}
```

**Response** `200` — updated folder object

---

### DELETE /folders/:id

**Response** `204` — no body

---

## Tags

### GET /tags

**Response** `200`
```json
[
  {
    "id": "cuid",
    "name": "string",
    "_count": { "notes": 3 }
  }
]
```

**Response** `500`
```json
{ "error": "Failed to fetch tags" }
```

---

### GET /tags/:id

**Response** `200` — tag object (without `_count`)

**Response** `404`
```json
{ "error": "Tag not found" }
```

---

### POST /tags

Tag names must be unique.

**Body**
```json
{ "name": "string" }
```

**Response** `201` — created tag object

**Response** `400`
```json
{ "error": "Failed to create tag" }
```

---

### PUT /tags/:id

**Body**
```json
{ "name": "string" }
```

**Response** `200` — updated tag object

**Response** `400`
```json
{ "error": "Failed to update tag" }
```

---

### DELETE /tags/:id

**Response** `204` — no body

**Response** `400`
```json
{ "error": "Failed to delete tag" }
```
