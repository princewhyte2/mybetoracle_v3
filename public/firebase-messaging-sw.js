// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js")
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js")

const firebaseConfig = {
  apiKey: "AIzaSyC4PN86hAr6MZVs-NQ2MdOoMxepf_juI10",
  authDomain: "mybetoracle.firebaseapp.com",
  projectId: "mybetoracle",
  storageBucket: "mybetoracle.appspot.com",
  messagingSenderId: "7671119791",
  appId: "1:7671119791:web:91f3506407640fcda6795a",
  measurementId: "G-W9WLR4T2E8",
}
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig)
// eslint-disable-next-line no-undef
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload)
  // you can remove this code. inother to avoid duplicate notifications
  // const notificationTitle = payload.notification.title
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: "/icons/maskable_icon_x72.png",
  //   vibrate: [200, 100, 200],
  // }
  // self.registration.showNotification(notificationTitle, notificationOptions)
  return
})
