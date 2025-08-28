// pages/api/cleanup-drafts.js or app/api/cleanup-drafts/route.js
export default async function handler(req, res) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('parties')
        .delete()
        .eq('status', 'draft')
        .lt('created_at', oneDayAgo.toISOString());
        
      res.json({ success: true, cleaned: data?.length || 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }