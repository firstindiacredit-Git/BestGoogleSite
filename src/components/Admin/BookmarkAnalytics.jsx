import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button, Modal, Table, Tag, Tooltip, Input, Select, Form, message } from 'antd';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Download, 
  Globe, 
  Copy as CopyIcon
} from 'lucide-react';

// Helpers
const formatDate = (iso) => {
  if (!iso) return 'Never';
  try { return new Date(iso).toLocaleString(); } catch { return 'Never'; }
};

// Validate URL, normalize and extract domain
const validateUrlFormat = (url) => {
  try {
    if (!url || url === 'undefined' || url === 'null' || String(url).trim() === '') {
      return { isValid: false, url: '', domain: null, protocol: null, error: 'URL is empty' };
    }
    const clean = String(url).trim();
    const withProtocol = clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`;
    const u = new URL(withProtocol);
    return { isValid: true, url: withProtocol, domain: u.hostname, protocol: u.protocol };
  } catch (e) {
    return { isValid: false, url: url || '', domain: null, protocol: null, error: `Invalid URL: ${e.message}` };
  }
};

// Fast URL status check with optimized performance
const checkUrlStatus = async (rawUrl) => {
  const v = validateUrlFormat(rawUrl);
  if (!v.isValid) {
    return { status: 'broken', domain: v.domain, responseTime: null, statusCode: null, error: v.error };
  }

  const startedAt = Date.now();
  
  try {
    // Simple and fast check - just try to fetch the URL directly
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(v.url, { 
        method: 'GET', 
        mode: 'no-cors', 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeout);
      
      return { 
        status: 'working', 
        domain: v.domain, 
        responseTime: Date.now() - startedAt, 
        statusCode: response.status || 'unknown', 
        error: null 
      };
      
    } catch (fetchError) {
      clearTimeout(timeout);
      
      // If fetch fails, try with image request (often works better)
      try {
        const imgController = new AbortController();
        const imgTimeout = setTimeout(() => imgController.abort(), 3000);
        
        const img = new Image();
        img.onload = () => {
          clearTimeout(imgTimeout);
        };
        img.onerror = () => {
          clearTimeout(imgTimeout);
        };
        
        // Try to load a small image from the domain
        img.src = `${v.url}/favicon.ico?${Date.now()}`;
        
        // Wait a bit for the image to load
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
        
        if (img.complete && img.naturalWidth > 0) {
          return { 
            status: 'working', 
            domain: v.domain, 
            responseTime: Date.now() - startedAt, 
            statusCode: '200', 
            error: null 
          };
        }
        
      } catch (imgError) {
        // Image check also failed
      }
      
      return { 
        status: 'broken', 
        domain: v.domain, 
        responseTime: null, 
        statusCode: null, 
        error: 'Website not accessible' 
      };
    }
    
  } catch (error) {
    return { status: 'broken', domain: v.domain, responseTime: null, statusCode: null, error: 'Request failed' };
  }
};

const StatusIcon = ({ status }) => {
  if (status === 'working') return <CheckCircle className="w-5 h-5 text-green-600" />;
  if (status === 'broken') return <XCircle className="w-5 h-5 text-red-600" />;
  return <Globe className="w-5 h-5 text-gray-500" />;
};

const BookmarkAnalytics = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  
  // Progress tracking for bulk checking
  const [checkProgress, setCheckProgress] = useState({ current: 0, total: 0, working: 0, broken: 0 });

  // Fetch bookmarks from all collections including PopularBookmarks categories
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      
      // Fetch all collections in parallel for speed
      const [
        globalQuerySnapshot,
        userQuerySnapshot,
        linksQuerySnapshot,
        catBookmarksQuerySnapshot,
        adminCategorySnapshot,
        userCategorySnapshot
      ] = await Promise.allSettled([
        getDocs(collection(db, 'bookmarks')),
        getDocs(collection(db, 'users', 'admin', 'shortcut')),
        getDocs(collection(db, 'links')),
        getDocs(collection(db, 'users', 'admin', 'CatBookmarks')),
        getDocs(collection(db, 'category')),
        getDocs(collection(db, 'users', 'admin', 'UserCategory'))
      ]);

      // Build category map quickly
      const categoryMap = new Map();
      
      if (adminCategorySnapshot.status === 'fulfilled') {
        adminCategorySnapshot.value.docs.forEach(doc => {
          const data = doc.data();
          categoryMap.set(doc.id, data.name || data.newCategory || 'Unknown Category');
        });
      }

      if (userCategorySnapshot.status === 'fulfilled') {
        userCategorySnapshot.value.docs.forEach(doc => {
          const data = doc.data();
          categoryMap.set(doc.id, data.newCategory || data.name || 'User Category');
        });
      }

      const getCategoryName = (categoryId) => {
        if (!categoryId) return 'General';
        return categoryMap.get(categoryId) || categoryId;
      };

      // Process all collections in parallel
      const processCollection = (snapshot, source, isUser = false, useCategoryMap = false) => {
        if (snapshot.status !== 'fulfilled') return [];
        
        return snapshot.value.docs.map(doc => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            name: data.name || data.title || 'Untitled',
            url: data.link || data.url || '',
            category: useCategoryMap ? getCategoryName(data.categoryId || data.category) : (data.category || 'General'),
            status: data.status || 'unknown',
            domain: data.domain || null,
            lastChecked: data.lastChecked || null,
            responseTime: data.responseTime || null,
            statusCode: data.statusCode || null,
            error: data.error || null,
            createdByUser: isUser,
            source,
            createdAt: data.createdAt || data.updatedAt || null,
          };
        });
      };

      const [
        globalBookmarksList,
        userBookmarksList,
        categoryBookmarksList,
        userCategoryBookmarksList
      ] = [
        processCollection(globalQuerySnapshot, 'Global Bookmarks', false, false),
        processCollection(userQuerySnapshot, 'User Shortcuts', true, false),
        processCollection(linksQuerySnapshot, 'Popular Categories', false, true),
        processCollection(catBookmarksQuerySnapshot, 'User Categories', true, true)
      ];

      // Combine and deduplicate efficiently
      const urlMap = new Map();
      const allBookmarks = [
        ...globalBookmarksList,
        ...userBookmarksList,
        ...categoryBookmarksList,
        ...userCategoryBookmarksList
      ];

      const uniqueBookmarks = allBookmarks.filter(bookmark => {
        if (!bookmark.url) return false;
        if (urlMap.has(bookmark.url)) return false;
        urlMap.set(bookmark.url, true);
        return true;
      });
      
      setBookmarks(uniqueBookmarks);
      
    } catch (e) {
      console.error('Error fetching bookmarks:', e);
      message.error('Failed to load bookmarks');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  // Analytics
  const analytics = useMemo(() => {
    const total = bookmarks.length;
    const working = bookmarks.filter(b => b.status === 'working').length;
    const broken = bookmarks.filter(b => b.status === 'broken').length;
    const unknown = total - working - broken;
    const workingPct = total ? Math.round((working / total) * 100) : 0;
    
    // Source breakdown
    const sourceBreakdown = bookmarks.reduce((acc, b) => {
      const source = b.source || 'Unknown';
      if (!acc[source]) acc[source] = { total: 0, working: 0, broken: 0, unknown: 0 };
      acc[source].total++;
      if (b.status === 'working') acc[source].working++;
      else if (b.status === 'broken') acc[source].broken++;
      else acc[source].unknown++;
      return acc;
    }, {});
    
    return { total, working, broken, unknown, workingPct, sourceBreakdown };
  }, [bookmarks]);

  // Filter + search
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookmarks.filter(b => {
      const statusOk = filterStatus === 'all' || b.status === filterStatus;
      const text = `${b.name} ${b.url} ${b.category} ${b.domain || ''}`.toLowerCase();
      const searchOk = !term || text.includes(term);
      return statusOk && searchOk;
    });
  }, [bookmarks, filterStatus, search]);

  // Actions
  const checkOne = async (bm) => {
    try {
      const result = await checkUrlStatus(bm.url);
      const updated = {
        ...bm,
        status: result.status,
        domain: result.domain || bm.domain,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        error: result.error || null,
        lastChecked: new Date().toISOString(),
      };
      setBookmarks(prev => prev.map(x => x.id === bm.id ? updated : x));
      
      // Determine which collection to update based on source
      let collectionPath = 'bookmarks';
      if (bm.source === 'User Shortcuts') {
        collectionPath = 'users/admin/shortcut';
      } else if (bm.source === 'Popular Categories') {
        collectionPath = 'links';
      } else if (bm.source === 'User Categories') {
        collectionPath = 'users/admin/CatBookmarks';
      }
      
      await updateDoc(doc(db, collectionPath, bm.id), {
        status: updated.status,
        domain: updated.domain,
        responseTime: updated.responseTime,
        statusCode: updated.statusCode,
        error: updated.error,
        lastChecked: updated.lastChecked,
      });
      if (updated.status === 'working') message.success(`Working: ${bm.name}`);
      else message.warning(`Broken: ${bm.name}`);
    } catch (e) {
      message.error('Check failed');
    }
  };

  const checkAll = async () => {
    if (!bookmarks.length) return;
    setChecking(true);
    
    // Initialize progress
    setCheckProgress({ current: 0, total: bookmarks.length, working: 0, broken: 0 });
    
    try {
      // Process URLs in smaller batches for better progress tracking
      const batchSize = 10; // Check 5 URLs at a time for more frequent updates
      const batches = [];
      
      for (let i = 0; i < bookmarks.length; i += batchSize) {
        batches.push(bookmarks.slice(i, i + batchSize));
      }
      
      let working = 0;
      let broken = 0;
      const updatedBookmarks = [...bookmarks];
      
      // Process each batch
      for (const batch of batches) {
        // Check all URLs in batch in parallel
        const results = await Promise.allSettled(
          batch.map(async (bm) => {
            const result = await checkUrlStatus(bm.url);
            return {
              bookmark: bm,
              result
            };
          })
        );
        
        // Update bookmarks with results
        results.forEach((promiseResult) => {
          if (promiseResult.status === 'fulfilled') {
            const { bookmark: bm, result } = promiseResult.value;
            const updated = {
              ...bm,
              status: result.status,
              domain: result.domain || bm.domain,
              responseTime: result.responseTime,
              statusCode: result.statusCode,
              error: result.error || null,
              lastChecked: new Date().toISOString(),
            };
            
            if (updated.status === 'working') working++;
            else broken++;
            
            // Update local state
            const bookmarkIndex = updatedBookmarks.findIndex(b => b.id === bm.id);
            if (bookmarkIndex !== -1) {
              updatedBookmarks[bookmarkIndex] = updated;
            }
            
            // Update Firebase in background (don't wait)
            let collectionPath = 'bookmarks';
            if (bm.source === 'User Shortcuts') {
              collectionPath = 'users/admin/shortcut';
            } else if (bm.source === 'Popular Categories') {
              collectionPath = 'links';
            } else if (bm.source === 'User Categories') {
              collectionPath = 'users/admin/CatBookmarks';
            }
            
            updateDoc(doc(db, collectionPath, bm.id), {
              status: updated.status,
              domain: updated.domain,
              responseTime: updated.responseTime,
              statusCode: updated.statusCode,
              error: updated.error,
              lastChecked: updated.lastChecked,
            }).catch(() => {}); // Ignore Firebase errors for speed
          }
        });
        
        // Update progress
        setCheckProgress(prev => ({
          ...prev,
          current: prev.current + batch.length,
          working,
          broken
        }));
        
        // Update UI after each batch
        setBookmarks([...updatedBookmarks]);
      }
      
      setChecking(false);
      setCheckProgress({ current: 0, total: 0, working: 0, broken: 0 });
      
      Modal.info({
        title: 'Check Complete',
        content: (
          <div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xl font-bold text-green-600">{working}</div>
                <div className="text-green-600 text-sm">Working</div>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="text-xl font-bold text-red-600">{broken}</div>
                <div className="text-red-600 text-sm">Broken</div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xl font-bold text-blue-600">{bookmarks.length}</div>
                <div className="text-blue-600 text-sm">Total</div>
              </div>
            </div>
            {broken > 0 && (
              <div className="max-h-56 overflow-auto space-y-2">
                {updatedBookmarks.filter(x => x.status === 'broken').map(b => (
                  <div key={b.id} className="text-xs p-2 rounded bg-red-50">
                    <div className="font-medium">{b.name}</div>
                    <div className="break-all text-gray-700">{b.url || 'No URL'}</div>
                    {b.error && <div className="text-red-500">{b.error}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      });
      
    } catch {
      setChecking(false);
      setCheckProgress({ current: 0, total: 0, working: 0, broken: 0 });
      message.error('Check failed');
    }
  };

  const onEdit = (bm) => {
    setEditing(bm);
    form.setFieldsValue({ name: bm.name, url: bm.url, category: bm.category });
    setEditOpen(true);
  };

  const saveEdit = async (values) => {
    if (!editing) return;
    const id = editing.id;
    try {
      // Determine which collection to update based on source
      let collectionPath = 'bookmarks';
      let updateData = {
        name: values.name,
        link: values.url, // Use 'link' field like ShortCuts.jsx
        category: values.category,
        status: 'unknown',
        lastChecked: null,
        error: null,
      };
      
      if (editing.source === 'User Shortcuts') {
        collectionPath = 'users/admin/shortcut';
      } else if (editing.source === 'Popular Categories') {
        collectionPath = 'links';
        updateData = {
          name: values.name,
          link: values.url,
          category: values.category,
          status: 'unknown',
          lastChecked: null,
          error: null,
        };
      } else if (editing.source === 'User Categories') {
        collectionPath = 'users/admin/CatBookmarks';
        updateData = {
          name: values.name,
          link: values.url,
          categoryId: values.category,
          status: 'unknown',
          lastChecked: null,
          error: null,
        };
      }
      
      await updateDoc(doc(db, collectionPath, id), updateData);
      
      setBookmarks(prev => prev.map(x => x.id === id ? { 
        ...x, 
        name: values.name,
        url: values.url,
        category: values.category,
        status: 'unknown', 
        lastChecked: null, 
        error: null 
      } : x));
      
      setEditOpen(false);
      setEditing(null);
      message.success('Bookmark updated');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      message.error('Failed to update');
    }
  };

  const onDelete = (bm) => {
    Modal.confirm({
      title: 'Delete Bookmark',
      content: `Are you sure you want to delete "${bm.name}"?`,
      okType: 'danger',
      onOk: async () => {
        try {
          // Determine which collection to delete from based on source
          let collectionPath = 'bookmarks';
          if (bm.source === 'User Shortcuts') {
            collectionPath = 'users/admin/shortcut';
          } else if (bm.source === 'Popular Categories') {
            collectionPath = 'links';
          } else if (bm.source === 'User Categories') {
            collectionPath = 'users/admin/CatBookmarks';
          }
          
          await deleteDoc(doc(db, collectionPath, bm.id));
          setBookmarks(prev => prev.filter(x => x.id !== bm.id));
          message.success('Deleted');
        } catch (error) {
          console.error('Error deleting bookmark:', error);
          message.error('Delete failed');
        }
      }
    });
  };

  const exportCsv = () => {
    const header = ['Name','URL','Category','Source','Status','Domain','Last Checked','Response Time (ms)','Status Code','Error'];
    const rows = bookmarks.map(b => [
      b.name,
      b.url || '',
      b.category || '',
      b.source || (b.createdByUser ? 'User' : 'Global'),
      b.status || '',
      b.domain || '',
      formatDate(b.lastChecked),
      b.responseTime ?? '',
      b.statusCode ?? '',
      b.error || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-analytics-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Exported CSV');
  };

  const columns = [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_, r) => (
        <Tooltip title={r.status}>
          <StatusIcon status={r.status} />
        </Tooltip>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (text) => (
        <div className="max-w-xs">
          <div className="text-xs break-all" title={text || 'No URL'}>{text || 'No URL'}</div>
          {!!text && (
            <button
              onClick={() => { navigator.clipboard.writeText(text); message.success('URL copied'); }}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1"
            >
              <CopyIcon className="w-3 h-3" /> Copy URL
            </button>
          )}
        </div>
      )
    },
    {
      title: 'Domain',
      key: 'domain',
      render: (_, r) => <span className="text-xs text-gray-600">{r.domain || (validateUrlFormat(r.url).domain || '-')}</span>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Source',
      key: 'source',
      render: (_, r) => {
        const getTagColor = (source) => {
          switch (source) {
            case 'Global Bookmarks': return 'orange';
            case 'User Shortcuts': return 'green';
            case 'Popular Categories': return 'blue';
            case 'User Categories': return 'purple';
            default: return 'default';
          }
        };
        
        return (
          <Tag color={getTagColor(r.source)}>
            {r.source || (r.createdByUser ? 'User' : 'Global')}
          </Tag>
        );
      }
    },
    {
      title: 'Last Checked',
      key: 'lastChecked',
      render: (_, r) => <span className="text-xs text-gray-600">{formatDate(r.lastChecked)}</span>
    },
    {
      title: 'Response',
      key: 'responseTime',
      render: (_, r) => <span className="text-xs">{r.responseTime ? `${r.responseTime}ms` : '-'}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, r) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Check">
            <Button type="text" icon={<RefreshCw className="w-4 h-4" />} onClick={() => checkOne(r)} loading={checking} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<Edit3 className="w-4 h-4" />} onClick={() => onEdit(r)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger type="text" icon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(r)} />
          </Tooltip>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 bg-gray-100 dark:bg-[#28283A] min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookmark Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Domain-based health check: if domain resolves → Working, else Broken.</p>
      </div>

             {/* Summary cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow">
           <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
           <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</div>
         </div>
         <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow">
           <div className="text-sm text-gray-600 dark:text-gray-300">Working</div>
           <div className="text-2xl font-bold text-green-600">{analytics.working}</div>
           <div className="text-xs text-green-500">{analytics.workingPct}%</div>
         </div>
         <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow">
           <div className="text-sm text-gray-600 dark:text-gray-300">Broken</div>
           <div className="text-2xl font-bold text-red-600">{analytics.broken}</div>
         </div>
         <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow">
           <div className="text-sm text-gray-600 dark:text-gray-300">Unknown</div>
           <div className="text-2xl font-bold text-yellow-500">{analytics.unknown}</div>
         </div>
       </div>

       {/* Source Breakdown */}
       {Object.keys(analytics.sourceBreakdown).length > 0 && (
         <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow mb-4">
           <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Source Breakdown</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {Object.entries(analytics.sourceBreakdown).map(([source, stats]) => (
               <div key={source} className="border rounded p-3">
                 <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">{source}</div>
                 <div className="grid grid-cols-3 gap-2 text-xs">
                   <div className="text-center">
                     <div className="font-bold text-green-600">{stats.working}</div>
                     <div className="text-gray-500">Working</div>
                   </div>
                   <div className="text-center">
                     <div className="font-bold text-red-600">{stats.broken}</div>
                     <div className="text-gray-500">Broken</div>
                   </div>
                   <div className="text-center">
                     <div className="font-bold text-yellow-600">{stats.unknown}</div>
                     <div className="text-gray-500">Unknown</div>
                   </div>
                 </div>
                 <div className="text-xs text-gray-500 mt-1 text-center">Total: {stats.total}</div>
               </div>
             ))}
           </div>
         </div>
       )}

             {/* Controls */}
       <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow mb-4 flex flex-wrap gap-3 items-center">
         <div className="flex items-center gap-2">
           <span className="text-sm">Filter:</span>
           <Select
             value={filterStatus}
             onChange={setFilterStatus}
             options={[
               { value: 'all', label: `All (${analytics.total})` },
               { value: 'working', label: `Working (${analytics.working})` },
               { value: 'broken', label: `Broken (${analytics.broken})` },
               { value: 'unknown', label: `Unknown (${analytics.unknown})` },
             ]}
             style={{ width: 180 }}
           />
         </div>
         <div className="flex items-center gap-2">
           <span className="text-sm">Search:</span>
           <Input placeholder="name, url, category..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
         </div>
         <div className="ml-auto flex items-center gap-2">
           <Button type="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={checkAll} loading={checking}>
             {checking ? `Checking (${checkProgress.current}/${checkProgress.total})` : 'Check All'}
           </Button>
           <Button icon={<RefreshCw className="w-4 h-4" />} onClick={fetchBookmarks}>Refresh</Button>
           <Button icon={<Download className="w-4 h-4" />} onClick={exportCsv}>Export CSV</Button>
         </div>
       </div>

       {/* Progress Bar */}
       {checking && checkProgress.total > 0 && (
         <div className="bg-white dark:bg-[#513a7a] p-4 rounded shadow mb-4">
           <div className="flex items-center justify-between mb-2">
             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
               Progress: {checkProgress.current} / {checkProgress.total} URLs
             </span>
             <span className="text-sm text-gray-500">
               {Math.round((checkProgress.current / checkProgress.total) * 100)}%
             </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
             <div 
               className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
               style={{ width: `${(checkProgress.current / checkProgress.total) * 100}%` }}
             ></div>
           </div>
           <div className="flex justify-between mt-2 text-xs text-gray-500">
             <span>Working: {checkProgress.working}</span>
             <span>Broken: {checkProgress.broken}</span>
             <span>Remaining: {checkProgress.total - checkProgress.current}</span>
           </div>
         </div>
       )}

      {/* Table */}
      <div className="bg-white dark:bg-[#513a7a] p-0 rounded shadow">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title={`Edit Bookmark${editing ? `: ${editing.name}` : ''}`}
        open={editOpen}
        onCancel={() => { setEditOpen(false); setEditing(null); }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={saveEdit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Bookmark name" />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: 'Please enter URL' }]}>
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please enter category' }]}>
            <Input placeholder="Category" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setEditOpen(false); setEditing(null); }}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BookmarkAnalytics;
