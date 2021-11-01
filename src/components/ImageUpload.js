/** @format */

import React, { useState } from 'react';
import firebase from 'firebase';
import db, { storage } from '../firebase';

//CSS
import './ImageUpload.scss';

function ImageUpload({ username, userAvatar }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
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
          db.collection('posts').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            caption: caption,
            imageUrl: url,
            username: username,
            userAvatar: userAvatar,
          });

          setCaption('');
          setImage(null);
        })
    );
  };

  return (
    <div className="imageUpload">
      <div className="imageUpload__container">
        <div className="imageUpload__inputs">
          <textarea
            type="text"
            onChange={(e) => setCaption(e.target.value)}
            value={caption}
            placeholder="What's on your mind?"
          />

          <input type="file" onChange={handleChange} />
        </div>
        <button
          type="submit"
          className="imageUpload__btn"
          onClick={handleUpload}
          disabled={!image}
        >
          Upload
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;
