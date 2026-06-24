import app from './src/app.js';
import { query } from './src/config/db.js';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🚀 Starting integration tests...');
  
  // Start server
  const server = app.listen(PORT, async () => {
    console.log(`📡 Test server listening on port ${PORT}`);
    
    try {
      // 1. Clean Database
      console.log('🧹 Cleaning test tables...');
      await query('DELETE FROM users'); // Cascades to posts, comments, likes, bookmarks due to ON DELETE CASCADE
      console.log('✅ Tables cleaned.');

      let token1 = '';
      let token2 = '';
      let user1Id = null;
      let user2Id = null;
      let post1Id = null;
      let post1Slug = '';
      let comment1Id = null;
      let comment2Id = null;

      // 2. Register User 1
      console.log('➡️ Registering User 1...');
      const regRes1 = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'alice',
          email: 'alice@example.com',
          password: 'password123',
        }),
      });
      const regData1 = await regRes1.json();
      if (!regData1.success) throw new Error(`User 1 registration failed: ${regData1.message}`);
      token1 = regData1.token;
      user1Id = regData1.user.id;
      console.log(`✅ Registered Alice (ID: ${user1Id})`);

      // 3. Register User 2
      console.log('➡️ Registering User 2...');
      const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'bob',
          email: 'bob@example.com',
          password: 'password123',
        }),
      });
      const regData2 = await regRes2.json();
      if (!regData2.success) throw new Error(`User 2 registration failed: ${regData2.message}`);
      token2 = regData2.token;
      user2Id = regData2.user.id;
      console.log(`✅ Registered Bob (ID: ${user2Id})`);

      // 4. Login User 1
      console.log('➡️ Logging in User 1...');
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'password123',
        }),
      });
      const loginData = await loginRes.json();
      if (!loginData.success) throw new Error(`Login failed: ${loginData.message}`);
      console.log('✅ Logged in successfully.');

      // 5. Update Profile (User 1)
      console.log('➡️ Updating Alice profile...');
      const profRes = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`,
        },
        body: JSON.stringify({
          bio: 'Software engineer and blogger.',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        }),
      });
      const profData = await profRes.json();
      if (!profData.success) throw new Error(`Profile update failed: ${profData.message}`);
      if (profData.user.bio !== 'Software engineer and blogger.') throw new Error('Bio update mismatch');
      console.log('✅ Profile updated.');

      // 6. Create Post (User 1, Draft)
      console.log('➡️ Creating Draft Post as Alice...');
      const postRes1 = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`,
        },
        body: JSON.stringify({
          title: 'My First Blog Post',
          content: 'This is the content of the blog post. Welcome!',
          excerpt: 'Welcome to my first blog post.',
          cover_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
          tags: ['first', 'intro'],
          is_published: false,
        }),
      });
      const postData1 = await postRes1.json();
      if (!postData1.success) throw new Error(`Create post failed: ${postData1.message}`);
      post1Id = postData1.data.id;
      post1Slug = postData1.data.slug;
      console.log(`✅ Draft post created (ID: ${post1Id}, Slug: ${post1Slug})`);

      // 7. Get Post By Slug (Author)
      console.log('➡️ Fetching post by slug (Author)...');
      const getPostRes1 = await fetch(`${BASE_URL}/posts/${post1Slug}`, {
        headers: { 'Authorization': `Bearer ${token1}` },
      });
      const getPostData1 = await getPostRes1.json();
      if (!getPostData1.success) throw new Error(`Fetch post failed: ${getPostData1.message}`);
      console.log('✅ Post fetched successfully by author.');

      // 8. Get Post By Slug (Anon should get 403 because it is a draft)
      console.log('➡️ Fetching draft post by slug (Anonymous - should fail)...');
      const getPostResAnon = await fetch(`${BASE_URL}/posts/${post1Slug}`);
      const getPostDataAnon = await getPostResAnon.json();
      if (getPostResAnon.status !== 403) throw new Error('Anon should not have access to drafts');
      console.log('✅ Correctly blocked anonymous view of draft.');

      // 9. Update Post to Published
      console.log('➡️ Publishing post...');
      const putPostRes = await fetch(`${BASE_URL}/posts/${post1Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`,
        },
        body: JSON.stringify({
          is_published: true,
        }),
      });
      const putPostData = await putPostRes.json();
      if (!putPostData.success) throw new Error(`Publish post failed: ${putPostData.message}`);
      console.log('✅ Post published.');

      // 10. Fetch Published Post as Anon (should now work!)
      console.log('➡️ Fetching published post by slug (Anonymous)...');
      const getPostResAnon2 = await fetch(`${BASE_URL}/posts/${post1Slug}`);
      const getPostDataAnon2 = await getPostResAnon2.json();
      if (!getPostDataAnon2.success) throw new Error('Anon should view published post');
      console.log('✅ Anon viewed published post successfully.');

      // 11. Like Post (User 2)
      console.log('➡️ Liking post as Bob...');
      const likeRes = await fetch(`${BASE_URL}/posts/${post1Id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token2}` },
      });
      const likeData = await likeRes.json();
      if (!likeData.success || likeData.likes_count !== 1) throw new Error('Liking post failed');
      console.log('✅ Post liked. Like count: ' + likeData.likes_count);

      // 12. Bookmark Post (User 2)
      console.log('➡️ Bookmarking post as Bob...');
      const bookRes = await fetch(`${BASE_URL}/posts/${post1Id}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token2}` },
      });
      const bookData = await bookRes.json();
      if (!bookData.success) throw new Error('Bookmarking post failed');
      console.log('✅ Post bookmarked.');

      // 13. Get Bookmarks (User 2)
      console.log('➡️ Getting Bob\'s bookmarks...');
      const getBookRes = await fetch(`${BASE_URL}/posts/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token2}` },
      });
      const getBookData = await getBookRes.json();
      if (!getBookData.success || getBookData.data.length !== 1) throw new Error('Get bookmarks failed');
      console.log('✅ Bookmarks fetched. Count: ' + getBookData.data.length);

      // 14. Add Comment (User 2)
      console.log('➡️ Adding comment as Bob...');
      const commentRes1 = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token2}`,
        },
        body: JSON.stringify({
          post_id: post1Id,
          content: 'This is an awesome post, Alice!',
        }),
      });
      const commentData1 = await commentRes1.json();
      if (!commentData1.success) throw new Error(`Add comment failed: ${commentData1.message}`);
      comment1Id = commentData1.data.id;
      console.log(`✅ Comment created (ID: ${comment1Id})`);

      // 15. Add Reply (User 1 replies to User 2's comment)
      console.log('➡️ Replying to comment as Alice...');
      const commentRes2 = await fetch(`${BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token1}`,
        },
        body: JSON.stringify({
          post_id: post1Id,
          parent_id: comment1Id,
          content: 'Thank you Bob, appreciate it!',
        }),
      });
      const commentData2 = await commentRes2.json();
      if (!commentData2.success) throw new Error(`Add reply failed: ${commentData2.message}`);
      comment2Id = commentData2.data.id;
      console.log(`✅ Reply created (ID: ${comment2Id}, Parent: ${comment1Id})`);

      // 16. Get Comments for Post
      console.log('➡️ Fetching comments for the post...');
      const getCommentsRes = await fetch(`${BASE_URL}/comments/post/${post1Id}`);
      const getCommentsData = await getCommentsRes.json();
      if (!getCommentsData.success || getCommentsData.data.length !== 2) throw new Error('Fetching comments failed');
      console.log(`✅ Fetched ${getCommentsData.data.length} comments.`);

      // 17. Update Comment (User 2 updates own comment)
      console.log('➡️ Updating Bob\'s comment...');
      const updateCommRes = await fetch(`${BASE_URL}/comments/${comment1Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token2}`,
        },
        body: JSON.stringify({
          content: 'This is an awesome post, Alice! Keep it up.',
        }),
      });
      const updateCommData = await updateCommRes.json();
      if (!updateCommData.success) throw new Error('Update comment failed');
      console.log('✅ Comment updated.');

      // 18. Delete Comment (User 2 deletes own comment)
      console.log('➡️ Deleting Bob\'s comment...');
      const delCommRes = await fetch(`${BASE_URL}/comments/${comment1Id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token2}` },
      });
      const delCommData = await delCommRes.json();
      if (!delCommData.success) throw new Error('Delete comment failed');
      console.log('✅ Comment deleted.');

      // 19. Clean up Post
      console.log('➡️ Deleting post...');
      const delPostRes = await fetch(`${BASE_URL}/posts/${post1Id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token1}` },
      });
      const delPostData = await delPostRes.json();
      if (!delPostData.success) throw new Error('Delete post failed');
      console.log('✅ Post deleted.');

      console.log('\n⭐ ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ⭐\n');
      server.close(() => {
        console.log('📡 Test server stopped.');
        process.exit(0);
      });

    } catch (error) {
      console.error('\n❌ INTEGRATION TEST FAILED:');
      console.error(error);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

runTests();
