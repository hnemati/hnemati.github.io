/*
Blog
*/
       
document.addEventListener("DOMContentLoaded", function() {
        fetch("microblog/posts.json")  
            .then(response => response.json())
            .then(posts => {
                if (posts.length > 0) {
                    const latestPost = posts[0];
                    const words = latestPost.text.split(" ").slice(0, 30).join(" ") + "...";

                    document.getElementById("post-preview").innerText = words;
                    document.getElementById("post-link").href = "blog.html"; 
                }
            })
            .catch(error => console.error("Error fetching latest post:", error));
});

