$(document).ready(function () {
    let orderData = null; // 주문 데이터를 전역 변수로 저장

    // 폼 데이터 확인 함수
    const checkFormCompletion = () => {
        const name = $('#buyerName').val().trim();
        const phone = $('#buyerPhone').val().trim();
        const id = $('#buyerId').val().trim();
        const deliveryMethod = $('input[name="deliveryMethod"]:checked').val();
        let hasProduct = false;

        // 상품 수량 확인
        $('.product-item').each(function () {
            const quantity = parseInt($(this).find('.quantity').val()) || 0;
            if (quantity > 0) {
                hasProduct = true;
            }
        });

        // 배송 정보 확인 (택배 배송일 경우)
        const address = $('#deliveryAddress').val().trim();
        const zip = $('#deliveryZip').val().trim();
        const deliveryComplete = deliveryMethod === 'pickup' || (address && zip);

        // 버튼 활성화/비활성화
        if (name && phone && id && hasProduct && deliveryComplete) {
            $('#reviewOrder').prop('disabled', false);
        } else {
            $('#reviewOrder').prop('disabled', true);
        }
    };

    // 상품 수량 입력 시 이벤트
    $('.quantity').on('input', function () {
        let total = 0;

        // 각 상품별 합계 계산
        $('.product-item').each(function () {
            const price = parseInt($(this).data('price'));
            const quantity = parseInt($(this).find('.quantity').val()) || 0;
            const itemTotal = price * quantity;

            $(this).find('.item-total').text(quantity > 0 ? `₩${itemTotal}` : '');
            total += itemTotal;
        });

        $('#totalAmount').text(total);

        checkFormCompletion();
    });

    // 구매자 정보 입력 시 이벤트
    $('#buyerName, #buyerPhone, #buyerId, #deliveryAddress, #deliveryZip').on('input', function () {
        checkFormCompletion();
    });

    // 수령 방법 변경 시 이벤트
    $('input[name="deliveryMethod"]').on('change', function () {
        const deliveryMethod = $(this).val();

        if (deliveryMethod === 'delivery') {
            $('.delivery-info').fadeIn();
        } else {
            $('.delivery-info').fadeOut();
        }

        checkFormCompletion();
    });

    // 주문 내역 확인 버튼 클릭 이벤트
    $('#reviewOrder').off('click').on('click', function () {
        let orderDetails = '';
        let finalAmount = 0;
        const products = [];

        // 각 상품 데이터 수집
        $('.product-item').each(function () {
            const name = $(this).find('p:first').text();
            const price = parseInt($(this).data('price'));
            const quantity = parseInt($(this).find('.quantity').val()) || 0;

            if (quantity > 0) {
                orderDetails += `<p>${name} x ${quantity} = ₩${price * quantity}</p>`;
                finalAmount += price * quantity;

                products.push({
                    name,
                    price,
                    quantity
                });
            }
        });

        const buyerName = $('#buyerName').val().trim();
        const buyerPhone = $('#buyerPhone').val().trim();
        const buyerId = $('#buyerId').val().trim();
        const deliveryMethod = $('input[name="deliveryMethod"]:checked').val();
        const deliveryAddress = $('#deliveryAddress').val().trim();
        const deliveryZip = $('#deliveryZip').val().trim();

        // 주문 데이터를 전역 변수에 저장
        orderData = {
            buyer: {
                name: buyerName,
                phone: buyerPhone,
                id: buyerId
            },
            products: products,
            totalAmount: finalAmount,
            deliveryMethod,
            deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
            deliveryZip: deliveryMethod === 'delivery' ? deliveryZip : null,
            status: '검토중', // 주문 상태를 "검토중"으로 설정
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 주문 요약 정보 업데이트
        $('#orderSummary').html(orderDetails);
        $('#finalAmount').text(finalAmount);
        $('#buyerDetails').html(`
            <p>구매자 이름: ${buyerName}</p>
            <p>전화번호: ${buyerPhone}</p>
            <p>학번: ${buyerId}</p>
            <p>수령 방법: ${deliveryMethod === 'pickup' ? '현장 수령' : '택배 배송'}</p>
            ${deliveryMethod === 'delivery' ? `<p>배송지: ${deliveryAddress}</p><p>우편번호: ${deliveryZip}</p>` : ''}
        `);

        $('#orderModal').fadeIn();
    });

    // "확인하였습니다" 버튼 클릭 이벤트
    $('#confirmButton').off('click').on('click', function () {
        if (orderData) {
            // Firestore에 데이터 저장
            db.collection('orders').add(orderData)
                .then(() => {
                    console.log('Firestore에 데이터 저장 성공');
                    alert('주문이 성공적으로 저장되었습니다! 감사합니다.');
                    window.location.href = 'order.html'; // Firestore 저장 성공 후 이동
                })
                .catch((error) => {
                    console.error('Firestore에 데이터 저장 실패:', error);
                    alert('주문 저장에 실패했습니다.');
                });
        } else {
            alert('주문 데이터가 없습니다.');
        }
    });

    // 모달 닫기 버튼 클릭 이벤트
    $('.close').off('click').on('click', function () {
        $('#orderModal').fadeOut();
    });

    // "뒤로 가기" 버튼 클릭 이벤트
    $('#backButton').off('click').on('click', function () {
        window.history.back(); // 이전 페이지로 이동
    });

    // 페이지 로드 시 버튼 초기 비활성화
    $('#reviewOrder').prop('disabled', true);
});
