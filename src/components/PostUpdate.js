/** @format */

import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import db, { storage } from '../firebase';

//CSS
import './ImageUpload.scss';

function PostUpdate({ postId, setOpenEditPost }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (postId) {
      db.collection('posts')
        .doc(postId)
        .onSnapshot((snapshot) => setPost(snapshot.data()));
    }
    console.log('POST<<<<<<<<', post);
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }

    // e.target.files[0] ? setImage(e.target.files[0]) : setImage(post.imageUrl);
  };

  const handleUpload = () => {
    if (caption && image) {
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress Bar function ...
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
        },
        // Catch erorr
        (error) => {
          alert(error.message);
        },
        // Complete function...
        storage
          .ref('images')
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            //post image inside db
            db.collection('posts').doc(postId).set(
              {
                caption: caption,
                imageUrl: url,
              },
              { merge: true }
            );
          })
      );
      setOpenEditPost(false);
    } else if (caption && !image) {
      db.collection('posts')
        .doc(postId)
        .set(
          {
            caption: caption ? caption : post.caption,
          },
          { merge: true }
        );
      setOpenEditPost(false);
    } else if (!caption && image) {
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress Bar function ...
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
        },
        // Catch erorr
        (error) => {
          alert(error.message);
        },
        // Complete function...
        storage
          .ref('images')
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            //post image inside db
            db.collection('posts')
              .doc(postId)
              .set(
                {
                  imageUrl: url ? url : post.imageUrl,
                },
                { merge: true }
              );
          })
      );
      setOpenEditPost(false);
    }
  };

  return (
    <div className="imageUpload">
      <div className="imageUpload__container">
        <h1 className="imageUpload__title"> Edit Post </h1>
        <div className="imageUpload__inputs">
          <textarea
            type="text"
            onChange={(e) => setCaption(e.target.value)}
            value={caption}
            // placeholder={post.caption}
            // value={caption ? caption : post.caption}
            // placeholder={caption ? caption : post.caption}
          />

          <input type="file" onChange={handleChange} />
        </div>
        <button
          type="submit"
          className="imageUpload__btn"
          onClick={handleUpload}
          // disabled={!image}
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default PostUpdate;
