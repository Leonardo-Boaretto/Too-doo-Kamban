document.addEventListener('DOMContentLoaded', function() {
    const simpleCard = document.querySelector('.simple-version');
    const completeCard = document.querySelector('.featured');
    const featureCards = document.querySelectorAll('.feature-card');

    const navigateTo = function(target) {
        window.location.href = target;
    };

    if (simpleCard) {
        simpleCard.addEventListener('click', function() {
            navigateTo('simple.html');
        });
    }

    if (completeCard) {
        completeCard.addEventListener('click', function() {
            navigateTo('complet.html');
        });
    }
});
