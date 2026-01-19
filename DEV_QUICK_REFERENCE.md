# Developer Quick Reference - Advanced Features

## Feature Implementation Summary

### 1. Sentiment Analysis (AI Feature)

**Location**: `backend/services/advancedAIService.js`

**How it works**:
- Analyzes text for emotional keywords
- Returns sentiment type: "positive", "negative", "urgent", or "neutral"
- Provides intensity score (0-100) and matching keywords

**Code Example**:
```javascript
const analysis = advancedAIService.analyzeSentiment(
  "This is terrible! No response for days."
);
// Returns: { sentiment: "negative", score: 85, keywords: ["terrible", "response"], intensity: 3 }
```

**Integration**:
- Used in `AdminDashboardPage.js` for complaint analysis
- Called when analyzing complaint for recommendations
- Frontend can use `complaintAIService.analyzeSentiment()` for real-time analysis

---

### 2. Response Suggestions (AI Feature)

**Location**: `backend/services/advancedAIService.js`

**How it works**:
- Generates category-specific response templates
- Adapts tone based on sentiment and priority
- Returns primary suggestion + alternatives

**Code Example**:
```javascript
const suggestions = advancedAIService.generateResponseSuggestions(
  "Water Supply", // category
  "urgent",       // sentiment
  "high"          // priority
);
// Returns: { 
//   primary: "We understand the urgency...", 
//   alternatives: [...], 
//   tone: "urgent" 
// }
```

**Integration**:
- Called when complaint is created or viewed
- Suggestions displayed in complaint detail view
- Officers use suggestions for quick responses

---

### 3. Duplicate Detection (AI Feature)

**Location**: `backend/services/advancedAIService.js` + `backend/controllers/adminController.js`

**How it works**:
- Compares complaint text using Jaccard similarity algorithm
- Returns similarity percentage (0-100%)
- Flags complaints >75% similar as potential duplicates
- Flags complaints 40-75% similar as potentially related

**Code Example**:
```javascript
const similar = advancedAIService.findSimilarComplaints(newComplaint, allComplaints);
// Returns: {
//   hasDuplicates: true,
//   similar: [{ complaintId: "123", similarity: 65 }],
//   duplicates: [{ complaintId: "456", similarity: 82 }],
//   recommendation: "Found 1 duplicate..."
// }
```

**Integration**:
- Endpoint: `GET /api/admin/complaints/duplicates/:complaintId`
- Called from `SimilarComplaintsPanel.js` component
- Admin can merge duplicates using `mergeDuplicateComplaints()`

---

### 4. Image Upload (File Management)

**Location**: `backend/utils/imageUpload.js` + `frontend/src/components/ImageUpload.js`

**Backend Functions**:
```javascript
// Validate file before upload
const validation = imageUpload.validateImageFile(file);

// Save uploaded file
const result = imageUpload.saveImageFile(file);
// Returns: { success, filename, url, size, mimetype }

// Save base64 encoded image
const result = imageUpload.saveBase64Image(base64Data, complaintId);

// Delete image
const result = imageUpload.deleteImageFile(filename);

// Retrieve image
const result = imageUpload.getImageFile(filename);
```

**Frontend Component**:
```javascript
// Props
<ImageUpload 
  onImagesChange={handleImages}
  maxImages={3}
  maxSize={5242880}
/>

// Callback receives array:
[
  { id: "img1", name: "photo.jpg", size: 2048576, data: "data:image/jpeg;base64,...", type: "image/jpeg" },
  ...
]
```

**Configuration**:
- Max file size: 5MB (5242880 bytes)
- Allowed formats: JPEG, PNG, GIF, WebP
- Max images per complaint: 3
- Storage: `backend/uploads/complaints/`

---

### 5. Admin Dashboard

**Location**: `frontend/src/pages/AdminDashboardPage.js`

**Tabs Available**:
1. **Overview Tab**
   - Total complaints count
   - Resolved count with percentage
   - In-progress count with assignment rate
   - Pending count
   - Priority breakdown
   - Status distribution

2. **Officers Tab**
   - Officer name
   - Total assigned complaints
   - Resolved count
   - Pending count
   - Resolution rate (%)
   - Average days to resolve

**Data Sources**:
```javascript
// System statistics
GET /api/admin/stats/system
// Response: { totalComplaints, complaintsByStatus, averageResolutionTime, ... }

// Officer performance
GET /api/admin/stats/officers
// Response: [{ id, name, totalAssigned, resolved, pending, resolutionRate, ... }]
```

**Access Control**:
```javascript
if (user.role !== 'admin') {
  return <div>Access denied</div>;
}
```

---

### 6. Bulk Assignment

**Location**: `frontend/src/components/BulkAssignmentModal.js`

**How to use**:
1. User selects multiple complaints (checkboxes)
2. Clicks "Bulk Assign" button
3. Modal opens with officer selection
4. Choose target officer
5. Click "Assign" to bulk assign all

**API Endpoint**:
```javascript
POST /api/admin/complaints/bulk-assign

Body: {
  complaintIds: ["id1", "id2", "id3"],
  assignToOfficerId: "officer123"
}

Response: { success: true, message: "3 complaints assigned", updated: 3 }
```

**Frontend Integration**:
```javascript
const handleBulkAssign = async (complaintIds, officerId) => {
  const response = await fetch('/api/admin/complaints/bulk-assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ complaintIds, assignToOfficerId: officerId })
  });
  const data = await response.json();
  if (data.success) showSuccess(`${data.updated} complaints assigned`);
};
```

---

### 7. Merge Duplicates

**Location**: `backend/controllers/adminController.js` + `frontend/src/components/SimilarComplaintsPanel.js`

**API Endpoint**:
```javascript
POST /api/admin/complaints/merge-duplicates

Body: {
  mainComplaintId: "complaint123",
  duplicateIds: ["complaint456", "complaint789"]
}

Response: { success: true, message: "Merged 2 duplicates", merged: 2 }
```

**What happens during merge**:
1. Main complaint keeps all its data
2. Duplicate complaint IDs stored in `duplicateIds` array
3. Update count increases for duplicates
4. Oldest complaint usually becomes main (consolidation)
5. History maintained in complaint object

---

## API Endpoints Reference

### Admin Stats Endpoints

```javascript
// System-wide statistics
GET /api/admin/stats/system
Headers: { Authorization: Bearer TOKEN }
Response: {
  totalComplaints: 45,
  totalUsers: 12,
  totalDepartments: 5,
  complaintsByStatus: { pending: 10, in-progress: 8, resolved: 25, rejected: 2 },
  complaintsByPriority: { low: 15, medium: 20, high: 10 },
  averageResolutionTime: 7,  // days
  pendingCount: 10,
  overdueCount: 2,
  assignmentRate: 80         // percentage
}

// Officer performance metrics
GET /api/admin/stats/officers
Response: [
  {
    id: "officer1",
    name: "John Doe",
    email: "john@example.com",
    department: "Water Supply",
    totalAssigned: 15,
    resolved: 12,
    inProgress: 2,
    pending: 1,
    resolutionRate: 80,
    averageResolutionTime: 6,
    responseTime: 4
  },
  ...
]

// Department metrics
GET /api/admin/stats/departments
Response: [
  {
    name: "Water Supply",
    total: 20,
    resolved: 16,
    pending: 4,
    resolutionRate: 80,
    avgResolutionDays: 5
  },
  ...
]
```

### Complaint Analysis Endpoints

```javascript
// Get complaints with AI analysis
GET /api/admin/complaints/analyzed?limit=20&offset=0&status=pending&category=water
Response: {
  total: 5,
  limit: 20,
  offset: 0,
  complaints: [
    {
      id: "complaint1",
      description: "...",
      category: "water",
      status: "pending",
      aiAnalysis: {
        sentiment: "urgent",
        score: 88,
        suggestions: ["Response 1", "Response 2"],
        similarComplaints: 2
      }
    },
    ...
  ]
}

// Analytics breakdown
GET /api/admin/analytics/complaints
Response: {
  byCategory: {
    "Water": { total: 20, pending: 5, resolved: 15 },
    "Electricity": { total: 15, pending: 8, resolved: 7 },
    ...
  },
  byStatus: { pending: 13, in-progress: 10, resolved: 22 },
  byPriority: { high: 8, medium: 18, low: 19 },
  byDepartment: { "Water Supply": 20, "Electricity": 15, ... },
  timeline: [
    { date: "2024-01-15", count: 3 },
    { date: "2024-01-16", count: 5 },
    ...
  ]
}
```

### Duplicate Management Endpoints

```javascript
// Find duplicate complaints
GET /api/admin/complaints/duplicates/:complaintId
Response: {
  complaintId: "complaint1",
  category: "Water",
  hasDuplicates: true,
  totalSimilar: 3,
  similar: [
    {
      id: "complaint2",
      description: "Similar issue...",
      similarity: 65,  // percentage
      type: "similar"
    },
    {
      id: "complaint3",
      description: "Duplicate issue...",
      similarity: 82,
      type: "duplicate"
    }
  ],
  duplicates: [...],  // Only items with >75% similarity
  recommendation: "Found 1 potential duplicate and 2 similar complaints"
}

// Merge duplicate complaints
POST /api/admin/complaints/merge-duplicates
Body: {
  mainComplaintId: "complaint1",
  duplicateIds: ["complaint2", "complaint3"]
}
Response: { success: true, message: "Merged 2 complaints", merged: 2 }
```

### Bulk Operations

```javascript
// Bulk assign complaints to officer
POST /api/admin/complaints/bulk-assign
Body: {
  complaintIds: ["id1", "id2", "id3"],
  assignToOfficerId: "officer123"
}
Response: { success: true, message: "3 complaints assigned", updated: 3 }
```

---

## Code Patterns

### Error Handling Pattern

```javascript
// Backend
try {
  const stats = adminController.getSystemStats();
  res.json(stats);
} catch (error) {
  console.error('Stats error:', error);
  res.status(500).json({ error: 'Failed to fetch statistics' });
}

// Frontend
try {
  const response = await fetch('/api/admin/stats/system', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  setStats(data);
} catch (error) {
  setError(error.message);
}
```

### State Management Pattern

```javascript
// In AdminDashboardPage
const [activeTab, setActiveTab] = useState('overview');
const [systemStats, setSystemStats] = useState(null);
const [officerStats, setOfficerStats] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const [sysResp, offResp] = await Promise.all([
      fetch('/api/admin/stats/system', headers),
      fetch('/api/admin/stats/officers', headers)
    ]);
    const sysData = await sysResp.json();
    const offData = await offResp.json();
    setSystemStats(sysData);
    setOfficerStats(offData);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### API Call Pattern

```javascript
// With proper headers
const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};

// Usage
const response = await fetchWithAuth('/api/admin/stats/system');
const data = await response.json();
```

---

## File Organization

```
Backend:
  services/
    advancedAIService.js     ← AI logic (sentiment, suggestions, similarity)
  controllers/
    adminController.js        ← Admin operations (get stats, bulk assign, merge)
  routes/
    adminRoutes.js           ← Admin API endpoints
  utils/
    imageUpload.js           ← Image handling utilities

Frontend:
  pages/
    AdminDashboardPage.js    ← Admin interface (stats, officers tabs)
  components/
    ImageUpload.js           ← Image upload UI
    BulkAssignmentModal.js   ← Bulk assign UI
    SimilarComplaintsPanel.js ← Duplicate detection UI
  services/
    complaintAIService.js    ← Frontend AI functions
  styles/
    AdminDashboard.css       ← Dashboard styling
    ImageUpload.css          ← Upload styling
    BulkAssignmentModal.css  ← Modal styling
    SimilarComplaintsPanel.css ← Panel styling
```

---

## Common Development Tasks

### Add New Admin Statistic

1. Add calculation in `adminController.js`:
```javascript
static getSystemStats() {
  // ... existing code ...
  stats.newMetric = calculateNewMetric();
  return stats;
}
```

2. Update response in `AdminDashboardPage.js`:
```javascript
<StatCard 
  title="New Metric"
  value={systemStats.newMetric}
  color="blue"
/>
```

### Add New Response Template

1. Edit `advancedAIService.js`:
```javascript
const RESPONSE_TEMPLATES = {
  "Water Supply": {
    default: "Thank you for reporting...",
    urgent: "We understand this is urgent..."
  },
  "New Category": {  // Add new category
    default: "Template text...",
    urgent: "Urgent template..."
  }
}
```

### Extend Image Upload

1. Update `imageUpload.js` configuration:
```javascript
const ALLOWED_TYPES = [..., 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // Increase to 10MB
```

2. Update frontend props:
```javascript
<ImageUpload maxSize={10 * 1024 * 1024} maxImages={5} />
```

### Add New Filter to Admin Dashboard

1. Add query parameter to API call:
```javascript
const response = await fetch(
  `/api/admin/complaints/analyzed?status=pending&priority=high&department=water`,
  headers
);
```

2. Add filter UI in component:
```javascript
<select onChange={(e) => setStatusFilter(e.target.value)}>
  <option value="">All Status</option>
  <option value="pending">Pending</option>
  <option value="in-progress">In Progress</option>
</select>
```

---

## Testing Quick Commands

```bash
# Test backend server
curl http://localhost:5000/api/admin/stats/system \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test image upload endpoint
curl -X POST http://localhost:5000/api/admin/complaints/bulk-assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"complaintIds": ["1"], "assignToOfficerId": "officer1"}'

# Check frontend compilation
npm run build

# Run frontend in development
npm start
```

---

## Useful Links

- **Backend Server**: http://localhost:5000
- **Frontend App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin-dashboard
- **API Documentation**: See ADVANCED_FEATURES.md
- **Testing Guide**: See TESTING_GUIDE.md
- **Deployment**: See DEPLOYMENT_CHECKLIST.md

---

**Last Updated**: January 18, 2026
**Version**: 1.0
**Status**: Complete & Tested
