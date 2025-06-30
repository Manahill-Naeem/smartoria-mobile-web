# MongoDB Atlas Setup for Next.js

1. Go to https://www.mongodb.com/atlas/database and create a free account.
2. Create a new project and a free cluster.
3. In your cluster, click 'Connect' > 'Connect your application'.
4. Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).
5. In your project root, create a file named `.env.local` and add:

```
MONGODB_URI=your_connection_string_here
```

6. Replace `your_connection_string_here` with your actual connection string.
7. Save the file and restart your dev server.

Your Next.js app is now connected to MongoDB Atlas!
