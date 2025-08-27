// Utility script to debug and fix LinkTree username mapping issues
// This script can be run in the browser console to help troubleshoot the firstindiacredit issue

const debugLinkTreeMapping = async (username) => {
  console.log("=== LinkTree Debug Utility ===");
  console.log("Debugging username:", username);

  try {
    // Check if Firebase is available
    if (typeof firebase === "undefined") {
      console.error(
        "Firebase not available. Make sure you are on a page with Firebase loaded."
      );
      return;
    }

    const { doc, getDoc, setDoc } = await import("firebase/firestore");
    const { db } = await import("./src/firebase.js");

    // 1. Check usernames collection
    console.log("\n1. Checking usernames collection...");
    const usernamesDocRef = doc(db, "usernames", "LinkTree");
    const usernamesDoc = await getDoc(usernamesDocRef);

    if (usernamesDoc.exists()) {
      const usernamesData = usernamesDoc.data();
      console.log("Usernames data:", usernamesData);

      if (usernamesData[username]) {
        console.log("✅ Username mapping found:", usernamesData[username]);
        const userId = usernamesData[username].uid;

        // 2. Check if LinkTree document exists for this user
        console.log("\n2. Checking LinkTree document for user ID:", userId);
        const linktreeDocRef = doc(db, "users", userId, "LinkTree", "profile");
        const linktreeDoc = await getDoc(linktreeDocRef);

        if (linktreeDoc.exists()) {
          const linktreeData = linktreeDoc.data();
          console.log("✅ LinkTree document found:", linktreeData);
          console.log(
            "Number of links:",
            linktreeData.links ? linktreeData.links.length : 0
          );
        } else {
          console.log("❌ LinkTree document not found for user ID:", userId);
        }
      } else {
        console.log("❌ Username not found in mapping");

        // 3. Try to find any LinkTree documents
        console.log("\n3. Checking if username might be a UID...");
        const directLinktreeDocRef = doc(
          db,
          "users",
          username,
          "LinkTree",
          "profile"
        );
        const directLinktreeDoc = await getDoc(directLinktreeDocRef);

        if (directLinktreeDoc.exists()) {
          console.log("✅ Found LinkTree document using username as UID");
          const linktreeData = directLinktreeDoc.data();
          console.log("LinkTree data:", linktreeData);
        } else {
          console.log("❌ No LinkTree document found using username as UID");
        }
      }
    } else {
      console.log("❌ Usernames collection does not exist");
    }

    console.log("\n=== Debug Complete ===");
  } catch (error) {
    console.error("Error during debug:", error);
  }
};

const fixUsernameMapping = async (username, userId) => {
  console.log("=== Fixing Username Mapping ===");
  console.log("Username:", username);
  console.log("User ID:", userId);

  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const { db } = await import("./src/firebase.js");

    // Create username mapping
    const usernamesDocRef = doc(db, "usernames", "LinkTree");
    await setDoc(
      usernamesDocRef,
      {
        [username]: {
          uid: userId,
          createdAt: new Date(),
        },
      },
      { merge: true }
    );

    console.log("✅ Username mapping created successfully");

    // Verify the mapping was created
    const { getDoc } = await import("firebase/firestore");
    const verifyDoc = await getDoc(usernamesDocRef);
    if (verifyDoc.exists()) {
      const data = verifyDoc.data();
      console.log("Verification - usernames data:", data);
    }
  } catch (error) {
    console.error("Error fixing username mapping:", error);
  }
};

// Export functions for use in browser console
window.debugLinkTreeMapping = debugLinkTreeMapping;
window.fixUsernameMapping = fixUsernameMapping;

console.log("LinkTree Debug Utility loaded!");
console.log("Usage:");
console.log('- debugLinkTreeMapping("firstindiacredit")');
console.log('- fixUsernameMapping("firstindiacredit", "USER_UID_HERE")');
