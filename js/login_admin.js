// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyD622KXV5yG9sdZcwpleL2Fq8MrntAWpPw",
    authDomain: "kwubranding.firebaseapp.com",
    projectId: "kwubranding",
    storageBucket: "kwubranding.firebasestorage.app",
    messagingSenderId: "901618759014",
    appId: "1:901618759014:web:e8777f040b5063865b44a7",
    measurementId: "G-0V6YBCMPNK"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

$(document).ready(function () {
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const inputId = $('#adminId').val().trim();
        const inputPassword = $('#adminPassword').val().trim();

        if (!inputId || !inputPassword) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        firebase.auth().signInWithEmailAndPassword(inputId, inputPassword)
            .then((userCredential) => {
                // 로그인 성공
                const user = userCredential.user;
                console.log('로그인 성공:', user);

                // 대시보드로 이동
                window.location.href = './dashboard.html';
            })
            .catch((error) => {
                console.error('로그인 실패:', error);
                alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.');
            });
    });
});
