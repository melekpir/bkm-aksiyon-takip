/**
 * BKM Aksiyon Takip - Frontend JavaScript
 * Version: Enhanced with duplicate handler fixes
 */

// WordPress jQuery uyumluluğu için
(function($) {
    'use strict';

    // ===== CONSOLE DEBUG INFO =====
    console.log('🚀 BKM Frontend JS başlatılıyor...');
    console.log('📊 jQuery versiyonu:', $.fn.jquery);
    console.log('🌍 bkmFrontend objesi:', typeof bkmFrontend !== 'undefined' ? 'MEVCUT' : 'EKSİK');
    
    if (typeof bkmFrontend !== 'undefined') {
        console.log('🔗 AJAX URL:', bkmFrontend.ajax_url);
        console.log('🔐 Nonce mevcut:', bkmFrontend.nonce ? 'EVET' : 'HAYIR');
        console.log('👤 Current User ID:', bkmFrontend.current_user_id);
    }

    // ===== GLOBAL FONKSİYONLAR =====
    
    /**
     * Show notification message to user
     */
    function showNotification(message, type) {
        // Modern AJAX notification system
        var notificationClass = type === 'error' ? 'error' : 'success';
        var notification = $('<div class="bkm-ajax-notification ' + notificationClass + '">' + 
                            '<span>' + message + '</span>' +
                            '<button class="close-btn" onclick="$(this).parent().removeClass(\'show\')">&times;</button>' +
                            '</div>');
        
        // Remove existing notifications
        $('.bkm-ajax-notification').remove();
        
        // Add to body
        $('body').append(notification);
        
        // Show with animation
        setTimeout(function() {
            notification.addClass('show');
        }, 100);
        
        // Auto hide after 5 seconds
        setTimeout(function() {
            notification.removeClass('show');
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Global olarak erişilebilir yap
    window.showNotification = showNotification;

    // Sayfada bkmFrontend objesi yoksa, hata kontrolü yap ve güvenli çıkış
    if (typeof bkmFrontend === 'undefined') {
        console.error('❌ KRITIK HATA: bkmFrontend objesi bulunamadı!');
        console.error('💡 ÇÖZÜM ÖNERISI: Sayfayı yenileyin veya WordPress\'e giriş yaptığınızdan emin olun');
        
        // Güvenli fallback objesi oluştur
        window.bkmFrontend = {
            ajax_url: '/wp-admin/admin-ajax.php',
            nonce: '',
            current_user_id: 0
        };
        
        // Kullanıcıya bilgi ver
        setTimeout(function() {
            showNotification('WordPress sistemi yüklenirken sorun oluştu. Lütfen sayfayı yenileyin.', 'error');
        }, 1000);
    }

// ===== GLOBAL FONKSİYONLAR (Document ready dışında tanımlanır) =====

// Ayarlar paneli toggle
function toggleSettingsPanel() {
    try {
        console.log('🔧 toggleSettingsPanel fonksiyonu çağrıldı');
        
        var panel = $('#bkm-settings-panel');
        console.log('📋 Panel elementi bulundu:', panel.length > 0);
        
        if (panel.length === 0) {
            console.error('❌ HATA: bkm-settings-panel elementi bulunamadı!');
            showNotification('Ayarlar paneli elementi bulunamadı!', 'error');
            return;
        }
        
        var isVisible = panel.is(':visible');
        console.log('👁️ Panel görünür durumda:', isVisible);
        
        if (isVisible) {
            console.log('🔼 Panel kapatılıyor...');
            
            // Panel kapatılırken tüm formları temizle
            clearAllSettingsForms();
            
            panel.slideUp();
        } else {
            console.log('🔽 Panel açılıyor...');
            // Diğer panelleri kapat
            $('#bkm-action-form, #bkm-task-form').slideUp();
            
            // Panel açılırken de tüm formları temizle
            clearAllSettingsForms();
            
            panel.slideDown();
            // İlk tab'ı aktif et
            if (!panel.find('.settings-tab.active').length) {
                console.log('🏷️ İlk tab aktif ediliyor...');
                switchSettingsTab('users'); // Users tab'ını varsayılan yap
            }
            // Verileri yükle - sadece gerekli durumlarda
            // loadUsers çağrısı kaldırıldı, PHP'den gelen liste kullanılacak
        }
    } catch (error) {
        console.error('❌ toggleSettingsPanel hatası:', error);
        showNotification('HATA: ' + error.message, 'error');
    }
}

// Filtre paneli toggle
function toggleFilterPanel() {
    try {
        console.log('🔍 toggleFilterPanel fonksiyonu çağrıldı');
        var panel = $('#bkm-filter-panel');
        if (panel.length === 0) {
            console.error('❌ HATA: bkm-filter-panel elementi bulunamadı!');
            if (typeof showNotification === 'function') {
                showNotification('Filtre paneli elementi bulunamadı!', 'error');
            }
            return;
        }
        var isVisible = panel.is(':visible');
        if (isVisible) {
            panel.slideUp();
            console.log('🔼 Filtre paneli kapatıldı');
        } else {
            // Diğer panelleri kapat
            $('#bkm-action-form, #bkm-task-form, #bkm-settings-panel').slideUp();
            panel.slideDown();
            console.log('🔽 Filtre paneli açıldı');
        }
    } catch (error) {
        console.error('❌ toggleFilterPanel hatası:', error);
        if (typeof showNotification === 'function') {
            showNotification('HATA: ' + error.message, 'error');
        }
    }
}

// Tab değiştirme fonksiyonu
function switchSettingsTab(tabName) {
    try {
        console.log('🔄 Tab değiştiriliyor:', tabName);
        
        // Tüm tab butonlarından active class'ını kaldır
        $('.settings-tab').removeClass('active');
        
        // Tüm tab content'lerini gizle
        $('.bkm-settings-tab-content').removeClass('active');
        
        // Seçilen tab'ı aktif et
        $('.settings-tab[data-tab="' + tabName + '"]').addClass('active');
        $('#settings-tab-' + tabName).addClass('active');
        
        // Tab'a özel yükleme işlemleri
        if (tabName === 'users') {
            // Kullanıcı formu temizle
            clearUserForm();
            // Kullanıcı listesini AJAX ile yükle
            console.log('👥 Users tab açıldı, kullanıcılar yükleniyor...');
            setTimeout(function() {
                loadUsers();
            }, 100);
        } else if (tabName === 'company' && typeof loadCompanyInfo === 'function') {
            loadCompanyInfo();
        }
    } catch (error) {
        console.error('❌ switchSettingsTab hatası:', error);
    }
}

// Test fonksiyonu
function testSettingsPanel() {
    console.log('🧪 Test: toggleSettingsPanel çağrılıyor...');
    toggleSettingsPanel();
}

// Fonksiyonları global olarak erişilebilir yap
window.toggleSettingsPanel = toggleSettingsPanel;
window.switchSettingsTab = switchSettingsTab;
window.testSettingsPanel = testSettingsPanel;
window.toggleFilterPanel = toggleFilterPanel;

// ===== KULLANICI YÖNETİMİ FONKSİYONLARI =====

// Kullanıcıları yükle - Error handling ile güçlendirilmiş
function loadUsers() {
    console.log('👥 Kullanıcılar yükleniyor...');
    if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
        console.error('❌ bkmFrontend objesi tanımlanmamış!');
        showNotification('WordPress AJAX sistemi hazır değil. Lütfen sayfayı yenileyin.', 'error');
        return;
    }
    $.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        dataType: 'json',
        timeout: 30000,
        data: {
            action: 'bkm_get_users',
            nonce: bkmFrontend.nonce
        },
        beforeSend: function() {
            $('#users-list').html('<div class="loading">Kullanıcılar yükleniyor...</div>');
        },
        success: function(response) {
            console.log('👥 Kullanıcılar yanıtı:', response);
            var users = response.data && response.data.users ? response.data.users : (Array.isArray(response.data) ? response.data : []);
            if (!Array.isArray(users)) users = [];
            if (response && response.success) {
                updateUsersDisplay(users);
            } else {
                var errorMessage = 'Bilinmeyen hata';
                if (response && response.data) {
                    if (typeof response.data === 'string') {
                        errorMessage = response.data;
                    } else if (response.data.message) {
                        errorMessage = response.data.message;
                    }
                }
                $('#users-list').html('<div class="error">Hata: ' + errorMessage + '</div>');
            }
        },
        error: function(xhr, status, error) {
            console.error('❌ Kullanıcılar yüklenirken hata:', error, xhr.responseText);
            var errorMsg = 'Kullanıcılar yüklenirken hata oluştu.';
            if (xhr.status === 0) {
                errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
            } else if (xhr.status === 403) {
                errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
            } else if (xhr.status === 404) {
                errorMsg = 'WordPress AJAX sistemi bulunamadı.';
            } else if (xhr.status === 500) {
                errorMsg = 'Sunucu hatası oluştu.';
            }
            $('#users-list').html('<div class="error">' + errorMsg + '</div>');
        }
    });
}

// Kullanıcıları listele
function displayUsers(users) {
    var html = '';
    
    if (users && users.length > 0) {
        html += '<table class="users-table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Kullanıcı Adı</th>';
        html += '<th>E-posta</th>';
        html += '<th>Rol</th>';
        html += '<th>Kayıt Tarihi</th>';
        html += '<th>İşlemler</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        
        $.each(users, function(index, user) {
            html += '<tr>';
            html += '<td>' + escapeHtml(user.display_name) + '</td>';
            html += '<td>' + escapeHtml(user.user_email) + '</td>';
            html += '<td>' + escapeHtml(user.role_name) + '</td>';
            html += '<td>' + user.registration_date + '</td>';
            html += '<td class="actions">';
            html += '<button onclick="editUser(' + user.ID + ', \'' + escapeHtml(user.user_login) + '\', \'' + escapeHtml(user.user_email) + '\', \'' + escapeHtml(user.display_name) + '\', \'' + user.role + '\')" class="edit-btn">Düzenle</button>';
            html += '<button onclick="deleteUser(' + user.ID + ', \'' + escapeHtml(user.display_name) + '\')" class="delete-btn">Sil</button>';
            html += '</td>';
            html += '</tr>';
        });
        
        html += '</tbody>';
        html += '</table>';
    } else {
        html = '<div class="no-items">Henüz kullanıcı bulunmuyor.</div>';
    }
    
    $('#users-list').html(html);
}

// HTML escape fonksiyonu
function escapeHtml(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Kullanıcı düzenle - Güvenlik kontrollü
function editUser(id, username, email, displayName, role) {
    console.log('✏️ editUser fonksiyonu çağrıldı:', id, username, email, displayName, role);
    
    // Güvenlik kontrolü - sadece admin kullanıcıları bu fonksiyonu kullanabilir
    var bodyClasses = document.body.className;
    var isAdmin = bodyClasses.includes('user-administrator');
    
    if (!isAdmin) {
        console.warn('🚫 YETKİSİZ ERİŞİM: Admin olmayan kullanıcı editUser fonksiyonunu çağırmaya çalıştı');
        alert('🚫 Bu işlem için yönetici yetkisi gereklidir!');
        return false;
    }
    
    console.log('✅ Yetki kontrolü geçildi, kullanıcı düzenleniyor:', id, username, email, displayName, role);
    
    var form = $('#bkm-user-form-element');
    form.find('#user_username').val(username).prop('disabled', true);
    form.find('#user_email').val(email);
    form.find('#user_display_name').val(displayName);
    
    // Rol seçimini güncelle - sadece allowed rolleri kontrol et
    var roleSelect = form.find('#user_role');
    var allowedRoles = ['administrator', 'editor', 'contributor'];
    
    // Eğer kullanıcının mevcut rolü allowed listede yoksa, uyarı ver ve contributor yap
    if (allowedRoles.indexOf(role) === -1) {
        console.warn('⚠️ Kullanıcının mevcut rolü (' + role + ') desteklenmiyor, contributor olarak ayarlanıyor');
        role = 'contributor';
    }
    
    roleSelect.val(role);
    form.find('#user_password').val('').prop('required', false);
    form.find('button[type="submit"]').text('✅ Kullanıcı Güncelle');
    form.data('edit-id', id);
    
    form.prev('h4').text('Kullanıcı Düzenle');
}

// Kullanıcı sil - Güvenlik kontrollü ve error handling ile güçlendirilmiş
function deleteUser(id, name) {
    console.log('🗑️ deleteUser fonksiyonu çağrıldı:', id, name);
    
    // Güvenlik kontrolü - sadece admin kullanıcıları bu fonksiyonu kullanabilir
    var bodyClasses = document.body.className;
    var isAdmin = bodyClasses.includes('user-administrator');
    
    if (!isAdmin) {
        console.warn('🚫 YETKİSİZ ERİŞİM: Admin olmayan kullanıcı deleteUser fonksiyonunu çağırmaya çalıştı');
        alert('🚫 Bu işlem için yönetici yetkisi gereklidir!');
        return false;
    }
    
    if (!confirm('⚠️ "' + name + '" kullanıcısını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!')) {
        return;
    }
    
    console.log('✅ Yetki kontrolü geçildi, kullanıcı siliniyor:', id, name);
    
    if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
        console.error('❌ bkmFrontend objesi tanımlanmamış!');
        alert('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.');
        return;
    }
    
    $.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        dataType: 'json',
        timeout: 30000,
        data: {
            action: 'bkm_delete_user',
            user_id: id,
            nonce: bkmFrontend.nonce
        },
        beforeSend: function() {
            if (typeof showNotification === 'function') {
                showNotification('Kullanıcı siliniyor...', 'info');
            }
        },
        success: function(response) {
            console.log('🗑️ Kullanıcı silme yanıtı:', response);
            
            if (response && response.success) {
                showNotification('Kullanıcı başarıyla silindi!', 'success');
                // Kullanıcı listesini yenile
                loadUsers();
            } else {
                var errorMessage = 'Kullanıcı silinemedi';
                if (response && response.data) {
                    if (typeof response.data === 'string') {
                        errorMessage = response.data;
                    } else if (response.data.message) {
                        errorMessage = response.data.message;
                    }
                }
                showNotification('Hata: ' + errorMessage, 'error');
            }
        },
        error: function(xhr, status, error) {
            console.error('❌ Kullanıcı silinirken hata:', error, xhr.responseText);
            
            var errorMsg = 'Kullanıcı silinirken hata oluştu.';
            if (xhr.status === 0) {
                errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
            } else if (xhr.status === 403) {
                errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
            } else if (xhr.status === 404) {
                errorMsg = 'WordPress AJAX sistemi bulunamadı.';
            } else if (xhr.status === 500) {
                errorMsg = 'Sunucu hatası oluştu.';
            }
            
            if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            }
        }
    });
}

// Kullanıcı formu temizle
function clearUserForm() {
    var form = $('#bkm-user-form-element');
    if (form.length > 0) {
        form[0].reset();
        form.find('#user_username').prop('disabled', false);
        form.find('#user_password').prop('required', true);
        form.find('button[type="submit"]').text('✅ Kullanıcı Ekle');
        form.removeData('edit-id');
        form.prev('h4').text('Yeni Kullanıcı Ekle');
        console.log('🧹 Kullanıcı formu temizlendi');
    }
}

// Kategori formu temizle
function clearCategoryForm() {
    var form = $('#bkm-category-form-element');
    if (form.length > 0) {
        form[0].reset();
        form.find('button[type="submit"]').text('✅ Kategori Ekle');
        form.removeData('edit-id');
        form.prev('h4').text('Yeni Kategori Ekle');
        console.log('🧹 Kategori formu temizlendi');
    }
}

// Performans formu temizle
function clearPerformanceForm() {
    var form = $('#bkm-performance-form-element');
    if (form.length > 0) {
        form[0].reset();
        form.find('button[type="submit"]').text('✅ Performans Ekle');
        form.removeData('edit-id');
        form.prev('h4').text('Yeni Performans Ekle');
        console.log('🧹 Performans formu temizlendi');
    }
}

// Firma ayarları formu temizle
function clearCompanyForm() {
    var form = $('#bkm-company-form-element');
    if (form.length > 0) {
        // Logo file input'u hariç diğer alanları temizle
        form.find('input[type="text"], input[type="email"], textarea').val('');
        form.find('input[type="file"]').val('');
        console.log('🧹 Firma ayarları formu temizlendi');
    }
}

// Tüm ayar formlarını temizle
function clearAllSettingsForms() {
    console.log('🧹 Tüm ayar formları temizleniyor...');
    clearUserForm();
    clearCategoryForm();
    clearPerformanceForm();
    clearCompanyForm();
}

// Kullanıcı formu submit handler - Error handling ile güçlendirilmiş
function handleUserFormSubmit(e) {
    e.preventDefault();
    console.log('👤 Kullanıcı formu submit edildi');
    
    if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
        console.error('❌ bkmFrontend objesi tanımlanmamış!');
        if (typeof showNotification === 'function') {
            showNotification('WordPress AJAX sistemi yüklenemedi. Sayfayı yenileyin.', 'error');
        } else {
            alert('WordPress AJAX sistemi yüklenemedi. Sayfayı yenileyin.');
        }
        return;
    }
    
    var form = $(e.target);
    var isEdit = form.data('edit-id');
    var formData = {
        action: isEdit ? 'bkm_edit_user' : 'bkm_add_user',
        nonce: bkmFrontend.nonce
    };
    
    // Form verilerini al
    form.find('input, select').each(function() {
        var name = $(this).attr('name');
        if (name) {
            formData[name] = $(this).val();
        }
    });
    
    if (isEdit) {
        formData.user_id = isEdit;
    }
    
    console.log('📤 Kullanıcı form verileri:', formData);
    
    $.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        dataType: 'json',
        timeout: 30000,
        data: formData,
        beforeSend: function() {
            form.find('button[type="submit"]').prop('disabled', true).text('Kaydediliyor...');
        },
        success: function(response) {
            console.log('👤 Kullanıcı kaydetme yanıtı:', response);
            
            form.find('button[type="submit"]').prop('disabled', false);
            
            if (response && response.success) {
                if (typeof showNotification === 'function') {
                    var message = response.data.message || (isEdit ? 'Kullanıcı güncellendi!' : 'Kullanıcı eklendi!');
                    showNotification(message, 'success');
                }
                clearUserForm();
                
                console.log('🔄 Kullanıcı ' + (isEdit ? 'güncellendi' : 'eklendi') + ', liste yenileniyor...');
                
                // Kullanıcı ekleme/güncelleme sonrası AJAX ile listeyi güncelle
                loadUsers();
                
                console.log('✅ loadUsers() çağrıldı');
            } else {
                form.find('button[type="submit"]').text(isEdit ? 'Kullanıcı Güncelle' : 'Kullanıcı Ekle');
                if (typeof showNotification === 'function') {
                    showNotification('Hata: ' + (response.data || 'İşlem başarısız'), 'error');
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('❌ Kullanıcı kaydedilirken hata:', error, xhr.responseText);
            form.find('button[type="submit"]').prop('disabled', false).text(isEdit ? 'Kullanıcı Güncelle' : 'Kullanıcı Ekle');
            
            var errorMsg = 'Kullanıcı kaydedilirken hata oluştu.';
            if (xhr.status === 0) {
                errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
            } else if (xhr.status === 403) {
                errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
            } else if (xhr.status === 404) {
                errorMsg = 'WordPress AJAX sistemi bulunamadı.';
            } else if (xhr.status === 500) {
                errorMsg = 'Sunucu hatası oluştu.';
            }
            
            if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            }
        }
    });
}

// Load users list via AJAX - Error handling ile güçlendirilmiş
function loadUsers() {
    console.log('🔄 Kullanıcı listesi yükleniyor...');
    
    if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
        console.error('❌ bkmFrontend objesi tanımlanmamış!');
        if (typeof showNotification === 'function') {
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
        }
        return;
    }
    
    $.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        dataType: 'json',
        timeout: 30000,
        data: {
            action: 'bkm_get_users',
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            console.log('👥 Kullanıcı listesi alındı:', response);
            
            if (response && response.success) {
                // PHP'den gelen veri yapısı: response.data.users
                var users = response.data.users || response.data;
                updateUsersDisplay(users);
                console.log('✅ Kullanıcı listesi güncellendi');
            } else {
                console.error('❌ Kullanıcı listesi alınamadı:', response.data);
                if (typeof showNotification === 'function') {
                    showNotification('Kullanıcı listesi güncellenirken hata oluştu.', 'error');
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('❌ Kullanıcı listesi AJAX hatası:', error, xhr.responseText);
            
            var errorMsg = 'Kullanıcı listesi yüklenirken bağlantı hatası oluştu.';
            if (xhr.status === 0) {
                errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
            } else if (xhr.status === 403) {
                errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
            } else if (xhr.status === 404) {
                errorMsg = 'WordPress AJAX sistemi bulunamadı.';
            } else if (xhr.status === 500) {
                errorMsg = 'Sunucu hatası oluştu.';
            }
            
            if (typeof showNotification === 'function') {
                showNotification(errorMsg, 'error');
            }
        }
    });
}

// Update users display
function updateUsersDisplay(users) {
    if (!Array.isArray(users)) users = [];
    console.log('🔄 updateUsersDisplay çağrıldı, kullanıcı sayısı:', users ? users.length : 'undefined');
    console.log('👥 Kullanıcı verisi:', users);
    
    var usersList = $('#users-list');
    // var currentUser = getCurrentUser(); // Hatalı satır kaldırıldı
    
    if (!usersList.length) {
        console.error('❌ #users-list elementi bulunamadı');
        return;
    }
    
    console.log('✅ #users-list elementi bulundu');
    
    // Update the header count
    var usersHeader = usersList.closest('.bkm-management-list').find('h4');
    if (usersHeader.length) {
        usersHeader.text('Mevcut Kullanıcılar (' + users.length + ' kullanıcı)');
        console.log('✅ Header güncellendi');
    } else {
        console.warn('⚠️ Users header bulunamadı');
    }
    
    // Clear current content
    usersList.empty();
    console.log('🧹 Liste temizlendi');
    
    if (!users || users.length === 0) {
        usersList.html('<div class="bkm-no-items">Kullanıcı bulunamadı. Sadece Editör ve Katılımcı rolüne sahip kullanıcılar görüntülenir.</div>');
        console.log('ℹ️ Boş kullanıcı listesi mesajı gösterildi');
        return;
    }
    
    console.log('🔧 ' + users.length + ' kullanıcı listesi oluşturuluyor...');
    
    // Build users HTML
    users.forEach(function(user, index) {
        console.log('👤 Kullanıcı ' + (index + 1) + ':', user.display_name);
        
        var registeredDate = user.registration_date || new Date(user.user_registered).toLocaleDateString('tr-TR');
        var roles = user.role_name || (Array.isArray(user.roles) ? user.roles.join(', ') : user.roles);
        
        var userHtml = `
            <div class="bkm-item" data-id="${user.ID}">
                <div class="bkm-item-content">
                    <strong>${escapeHtml(user.display_name)}</strong>
                    <p>
                        <span class="bkm-user-email">📧 ${escapeHtml(user.user_email)}</span><br>
                        <span class="bkm-user-role">👤 ${escapeHtml(roles)}</span><br>
                        <span class="bkm-user-registered">📅 ${registeredDate}</span>
                    </p>
                </div>
                <div class="bkm-item-actions">
                    <button class="bkm-btn bkm-btn-small bkm-btn-info" onclick="editUser(${user.ID}, '${escapeJs(user.user_login)}', '${escapeJs(user.user_email)}', '${escapeJs(user.first_name)}', '${escapeJs(user.last_name)}', '${escapeJs(roles)}')">
                        ✏️ Düzenle
                    </button>`;
                    
        // Don't show delete button for current user (we'll add this check later if needed)
        userHtml += `
                    <button class="bkm-btn bkm-btn-small bkm-btn-danger" onclick="deleteUser(${user.ID}, '${escapeJs(user.display_name)}')">
                        🗑️ Sil
                    </button>
                </div>
            </div>`;
        
        usersList.append(userHtml);
    });
    
    console.log('✅ Kullanıcı listesi oluşturma tamamlandı');
    
    // Add animation for new content
    usersList.hide().fadeIn(300);
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Helper function to escape JavaScript strings
function escapeJs(text) {
    if (!text) return '';
    return text.toString().replace(/'/g, "\\'").replace(/"/g, '\\"');
}

jQuery(document).ready(function($) {
    // Debug information
    console.log('🔧 BKM Frontend JS yüklendi');
    console.log('📊 jQuery versiyonu:', $.fn.jquery);
    console.log('🌍 bkmFrontend objesi:', typeof bkmFrontend !== 'undefined' ? bkmFrontend : 'UNDEFINED');
    
    // Test fonksiyonları
    console.log('🧪 toggleSettingsPanel fonksiyonu:', typeof toggleSettingsPanel);
    console.log('🧪 Global fonksiyonlar test ediliyor...');
    
    // Global test fonksiyonu ekle
    window.testSettingsPanel = testSettingsPanel;
    window.toggleSettingsPanel = toggleSettingsPanel;
    window.switchSettingsTab = switchSettingsTab;
    window.toggleFilterPanel = toggleFilterPanel;
    
    // Test if user is logged in properly
    if (typeof bkmFrontend !== 'undefined' && bkmFrontend.ajax_url) {
        console.log('✅ WordPress AJAX sistemi aktif');
        console.log('🔗 AJAX URL:', bkmFrontend.ajax_url);
        console.log('🔐 Nonce token mevcut:', bkmFrontend.nonce ? 'YES' : 'NO');
        console.log('👤 Current User ID:', bkmFrontend.current_user_id);
    } else {
        console.error('❌ KRITIK HATA: bkmFrontend objesi yüklenemedi!');
        console.error('💡 ÇÖZÜM: WordPress admin paneline giriş yapın veya sayfayı yenileyin');
        
        // Kullanıcıya uyarı göster
        setTimeout(function() {
            if (typeof showNotification === 'function') {
                showNotification('WordPress bağlantısı kurulamadı. Lütfen sayfayı yenileyin ve giriş yapmayı deneyin.', 'error');
            }
        }, 2000);
    }
    
    // Test if task form exists
    if ($('#bkm-task-form-element').length > 0) {
        console.log('✅ Görev ekleme formu bulundu');
    } else {
        console.log('⚠️ Görev ekleme formu bulunamadı - sadece yetkili kullanıcılar görebilir');
    }
    
    // Debug forms availability
    console.log('📋 FORM DURUMU:');
    console.log('- Action Form:', $('#bkm-action-form-element').length > 0 ? 'MEVCUT' : 'YOK');
    console.log('- Task Form:', $('#bkm-task-form-element').length > 0 ? 'MEVCUT' : 'YOK');
    console.log('- User Form:', $('#bkm-user-form-element').length > 0 ? 'MEVCUT' : 'YOK');
    console.log('- Category Form:', $('#bkm-category-form-element').length > 0 ? 'MEVCUT' : 'YOK');
    console.log('- Performance Form:', $('#bkm-performance-form-element').length > 0 ? 'MEVCUT' : 'YOK');
    console.log('- Company Form:', $('#bkm-company-form-element').length > 0 ? 'MEVCUT' : 'YOK');
    console.log('- Settings Panel:', $('#bkm-settings-panel').length > 0 ? 'MEVCUT' : 'YOK');
    
    // ===== FORM SUBMIT HANDLERS =====
    
    // Kullanıcı formu submit handler
    $(document).on('submit', '#bkm-user-form-element', function(e) {
        handleUserFormSubmit(e);
    });
    
    // Kategori formu submit handler
    $(document).on('submit', '#bkm-category-form-element', function(e) {
        e.preventDefault();
        console.log('📂 Kategori formu submit edildi');
        
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
            return;
        }
        
        var form = $(this);
        var formData = form.serialize();
        var editId = form.data('edit-id');
        var isEdit = editId ? true : false;
        
        // Validate
        var name = form.find('#category_name').val().trim();
        if (!name) {
            showNotification('Kategori adı boş olamaz.', 'error');
            return;
        }
        
        // Disable form
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('İşleniyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: formData + '&action=' + (isEdit ? 'bkm_edit_category' : 'bkm_add_category') + 
                  '&nonce=' + bkmFrontend.nonce + (isEdit ? '&id=' + editId : ''),
            success: function(response) {
                console.log('📂 Kategori AJAX yanıtı:', response);
                
                if (response && response.success) {
                    var message = 'Kategori başarıyla kaydedildi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    showNotification(message, 'success');
                    form[0].reset();
                    clearCategoryForm();
                    
                    console.log('🔄 Kategori başarıyla eklendi, liste güncelleniyor...');
                    // Refresh category list if function exists
                    if (typeof refreshCategoryDropdown === 'function') {
                        console.log('✅ refreshCategoryDropdown fonksiyonu çağrılıyor...');
                        refreshCategoryDropdown();
                    } else {
                        console.error('❌ refreshCategoryDropdown fonksiyonu bulunamadı!');
                    }
                } else {
                    var errorMessage = 'Kategori işlemi sırasında hata oluştu.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Kategori hatası:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Kategori işlemi hatası:', error, xhr.responseText);
                
                var errorMsg = 'İşlem sırasında bir hata oluştu.';
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Kategori Ekle');
            }
        });
    });
    
    // Performans formu submit handler
    $(document).on('submit', '#bkm-performance-form-element', function(e) {
        e.preventDefault();
        console.log('📊 Performans formu submit edildi');
        
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
            return;
        }
        
        var form = $(this);
        var formData = form.serialize();
        var editId = form.data('edit-id');
        var isEdit = editId ? true : false;
        
        // Validate
        var name = form.find('#performance_name').val().trim();
        if (!name) {
            showNotification('Performans adı boş olamaz.', 'error');
            return;
        }
        
        // Disable form
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('İşleniyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: formData + '&action=' + (isEdit ? 'bkm_edit_performance' : 'bkm_add_performance') + 
                  '&nonce=' + bkmFrontend.nonce + (isEdit ? '&id=' + editId : ''),
            success: function(response) {
                console.log('📊 Performans AJAX yanıtı:', response);
                
                if (response && response.success) {
                    var message = 'Performans başarıyla kaydedildi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    showNotification(message, 'success');
                    form[0].reset();
                    clearPerformanceForm();
                    
                    console.log('🔄 Performans başarıyla eklendi, liste güncelleniyor...');
                    // Refresh performance list if function exists
                    if (typeof refreshPerformanceDropdown === 'function') {
                        console.log('✅ refreshPerformanceDropdown fonksiyonu çağrılıyor...');
                        refreshPerformanceDropdown();
                    } else {
                        console.error('❌ refreshPerformanceDropdown fonksiyonu bulunamadı!');
                    }
                } else {
                    var errorMessage = 'Performans işlemi sırasında hata oluştu.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Performans hatası:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Performans işlemi hatası:', error, xhr.responseText);
                
                var errorMsg = 'İşlem sırasında bir hata oluştu.';
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Performans Ekle');
            }
        });
    });
    
    // Company form submit handler
    $(document).on('submit', '#bkm-company-form-element', function(e) {
        e.preventDefault();
        console.log('🏢 Company form submit edildi');
        
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
            return;
        }
        
        var form = $(this);
        var formData = new FormData(this);
        formData.append('action', 'bkm_save_company_settings');
        formData.append('nonce', bkmFrontend.nonce);
        
        // Add loading class
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('Kaydediliyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('🏢 Firma bilgileri AJAX yanıtı:', response);
                
                if (response && response.success) {
                    var message = 'Firma bilgileri başarıyla kaydedildi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    showNotification(message, 'success');
                } else {
                    var errorMessage = 'Firma bilgileri kaydedilemedi.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Firma bilgileri hatası:', errorMessage);
                    showNotification('Hata: ' + errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Firma bilgileri kaydetme hatası:', error, xhr.responseText);
                
                var errorMsg = 'Firma bilgileri kaydedilirken bir hata oluştu.';
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Firma Bilgilerini Kaydet');
            }
        });
    });
    
    // Aksiyon formu submit handler
    $(document).on('submit', '#bkm-action-form-element', function(e) {
        e.preventDefault();
        console.log('🎯 Aksiyon formu submit edildi');
        
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
            return;
        }
        
        var form = $(this);
        var formData = form.serialize();
        
        // Validate required fields
        var isValid = true;
        form.find('[required]').each(function() {
            if (!$(this).val()) {
                $(this).addClass('error');
                isValid = false;
            } else {
                $(this).removeClass('error');
            }
        });
        
        if (!isValid) {
            showNotification('Lütfen tüm zorunlu alanları doldurun.', 'error');
            return;
        }
        
        // Disable form during submission
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('Ekleniyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: formData + '&action=bkm_add_action&nonce=' + bkmFrontend.nonce,
            success: function(response) {
                console.log('🎯 Aksiyon AJAX yanıtı:', response);
                
                if (response && response.success) {
                    var message = 'Aksiyon başarıyla eklendi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    showNotification(message, 'success');
                    form[0].reset();
                    // Hide form if toggle function exists
                    if (typeof toggleActionForm === 'function') {
                        toggleActionForm();
                    }
                    
                    // Add new action to the table without page refresh
                    if (response.data && response.data.action_id) {
                        addNewActionToTable(response.data);
                    } else {
                        // Fallback to page refresh if action data not available
                        setTimeout(function() {
                            window.location.reload();
                        }, 1500);
                    }
                } else {
                    var errorMessage = 'Aksiyon eklenirken hata oluştu.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Aksiyon hatası:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Aksiyon ekleme hatası:', error, xhr.responseText);
                
                var errorMsg = 'Bir hata oluştu: ' + error;
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                // Re-enable form
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Aksiyon Ekle');
            }
        });
    });
    
    // Görev formu submit handler - Enhanced
    $(document).on('submit', '#bkm-task-form-element', function(e) {
        e.preventDefault();
        console.log('📋 Görev formu submit edildi');
        
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
            return;
        }
        
        var form = $(this);
        var formData = new FormData(form[0]);
        
        console.log('📝 Form elementi bilgileri:');
        form.find('input, select, textarea').each(function() {
            console.log('  - ' + $(this).attr('name') + ': ' + $(this).val());
        });
        
        // Enhanced data mapping with multiple field name support
        var mappedData = {
            action: 'bkm_add_task',
            nonce: bkmFrontend.nonce
        };
        
        // Primary field mappings from FormData
        for (let [key, value] of formData) {
            mappedData[key] = value;
        }
        
        // Secondary field name support for legacy compatibility
        if (!mappedData.action_id && (mappedData.aksiyon_id || form.find('[name="aksiyon_id"]').val())) {
            mappedData.action_id = mappedData.aksiyon_id || form.find('[name="aksiyon_id"]').val();
        }
        
        if (!mappedData.content) {
            mappedData.content = mappedData.aciklama || mappedData.title || mappedData.description || form.find('[name="aciklama"]').val();
        }
        
        if (!mappedData.description) {
            mappedData.description = mappedData.aciklama || mappedData.content || form.find('[name="aciklama"]').val();
        }
        
        if (!mappedData.hedef_bitis_tarihi) {
            mappedData.hedef_bitis_tarihi = mappedData.bitis_tarihi || mappedData.target_date || form.find('[name="bitis_tarihi"]').val() || form.find('[name="hedef_bitis_tarihi"]').val();
        }
        
        if (!mappedData.sorumlu_id) {
            mappedData.sorumlu_id = mappedData.responsible || form.find('[name="sorumlu_id"]').val();
        }
        
        if (!mappedData.baslangic_tarihi) {
            mappedData.baslangic_tarihi = mappedData.start_date || form.find('[name="baslangic_tarihi"]').val() || new Date().toISOString().split('T')[0];
        }
        
        console.log('📋 Enhanced mapped data:', mappedData);
        
        // Enhanced validation with comprehensive field checking
        var validationErrors = [];
        
        if (!mappedData.action_id || mappedData.action_id <= 0) {
            validationErrors.push('Aksiyon ID gerekli');
        }
        
        if (!mappedData.aciklama && !mappedData.content) {
            validationErrors.push('Görev içeriği gerekli');
        }
        
        if (!mappedData.sorumlu_id || mappedData.sorumlu_id <= 0) {
            validationErrors.push('Sorumlu kişi gerekli');
        }
        
        if (!mappedData.bitis_tarihi && !mappedData.hedef_bitis_tarihi) {
            validationErrors.push('Hedef bitiş tarihi gerekli');
        }
        
        if (validationErrors.length > 0) {
            console.error('❌ Validation errors:', validationErrors);
            showNotification('Eksik alanlar: ' + validationErrors.join(', '), 'error');
            
            // Highlight error fields
            form.find('[required]').each(function() {
                if (!$(this).val()) {
                    $(this).addClass('error');
                } else {
                    $(this).removeClass('error');
                }
            });
            
            return;
        }
        
        // Disable form during submission
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('Ekleniyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: mappedData,
            success: function(response) {
                console.log('📋 Görev AJAX yanıtı:', response);
                
                if (response && response.success) {
                    var message = 'Görev başarıyla eklendi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    showNotification(message, 'success');
                    form[0].reset();
                    // Hide form if toggle function exists
                    if (typeof toggleTaskForm === 'function') {
                        toggleTaskForm();
                    }
                    
                    // Add new task to the UI without page refresh
                    if (response.data && response.data.task_data) {
                        addNewTaskToAction(response.data.task_data);
                    } else {
                        // Fallback to page refresh if task data not available
                        setTimeout(function() {
                            window.location.reload();
                        }, 1500);
                    }
                } else {
                    var errorMessage = 'Görev eklenirken hata oluştu.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Görev hatası:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Görev ekleme hatası:', error, xhr.responseText);
                
                var errorMsg = 'Bir hata oluştu: ' + error;
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                // Re-enable form
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Görev Ekle');
            }
        });
    });
    
    // Ana not ekleme formu AJAX (görev notları dahil) - Error handling ile güçlendirilmiş
    $(document).on('submit', '.bkm-note-form form:not(.bkm-reply-form), .bkm-task-note-form-element', function(e) {
        e.preventDefault();
        console.log('🔧 Not ekleme formu submit edildi');
        
        var form = $(this);
        var taskId = form.find('input[name="task_id"]').val();
        var content = form.find('textarea[name="note_content"]').val().trim();
        var progressValue = form.find('input[name="note_progress"]').val();
        
        console.log('📝 Task ID:', taskId, 'Content:', content, 'Progress:', progressValue);
        
        if (!content) {
            showNotification('Not içeriği boş olamaz.', 'error');
            return;
        }
        
        // Progress validation
        if (progressValue !== '' && progressValue !== null) {
            var progress = parseInt(progressValue);
            if (isNaN(progress) || progress < 0 || progress > 100) {
                showNotification('İlerleme durumu 0-100 arasında olmalıdır.', 'error');
                form.find('input[name="note_progress"]').focus();
                return;
            }
        }
        
        // Check if bkmFrontend is available
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi yüklenmedi. Sayfayı yenileyin.', 'error');
            return;
        }
        
        // Disable form during submission
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('Gönderiliyor...');
        
        var ajaxData = {
            action: 'bkm_add_note',
            task_id: taskId,
            content: content,
            nonce: bkmFrontend.nonce
        };
        
        // Add progress if provided
        if (progressValue !== '' && progressValue !== null) {
            ajaxData.progress = progressValue;
        }
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: ajaxData,
            success: function(response) {
                console.log('🔄 AJAX response alındı:', response);
                if (response && response.success) {
                    // Store current progress value before clearing form
                    var progressInput = form.find('input[name="note_progress"]');
                    var originalProgress = progressInput.attr('value') || progressInput.val();
                    
                    // Clear form
                    form[0].reset();
                    
                    // Restore original progress value to the input for next use
                    if (response.data.progress_updated && response.data.new_progress !== undefined) {
                        progressInput.val(response.data.new_progress);
                        progressInput.attr('value', response.data.new_progress);
                        
                        // Update the small text showing current progress
                        var smallText = progressInput.siblings('small');
                        if (smallText.length > 0) {
                            smallText.text('Mevcut: ' + response.data.new_progress + '%');
                        }
                    } else {
                        progressInput.val(originalProgress);
                    }
                    
                    // Hide note form
                    toggleNoteForm(taskId);
                    
                    // Update task progress bar if progress was updated
                    if (response.data.progress_updated && response.data.new_progress !== undefined) {
                        console.log('🔄 İlerleme güncelleniyor:', response.data.new_progress + '%');
                        
                        // Find the task item with matching task ID using data attribute
                        var taskItem = $('.bkm-task-item[data-task-id="' + taskId + '"]');
                        console.log('🎯 Task item bulundu:', taskItem.length);
                        
                        if (taskItem.length > 0) {
                            var progressBar = taskItem.find('.bkm-progress-bar');
                            var progressText = taskItem.find('.bkm-progress-text');
                            
                            console.log('✅ İlerleme çubuğu bulundu:', progressBar.length, 'Progress Text:', progressText.length);
                            
                            if (progressBar.length > 0) {
                                // Animate progress bar update
                                progressBar.animate({
                                    width: response.data.new_progress + '%'
                                }, 500, function() {
                                    // Add visual feedback after animation
                                    progressBar.addClass('progress-updated');
                                    setTimeout(function() {
                                        progressBar.removeClass('progress-updated');
                                    }, 2000);
                                });
                                
                                if (progressText.length > 0) {
                                    progressText.text(response.data.new_progress + '%');
                                }
                                
                                console.log('✅ İlerleme çubuğu güncellendi:', response.data.new_progress + '%');
                                
                                // If task is completed (100%), add visual indicator
                                if (response.data.new_progress == 100) {
                                    taskItem.addClass('completed');
                                    
                                    // Show completion message
                                    showNotification('🎉 Görev tamamlandı!', 'success');
                                    
                                    // Update task actions - hide complete button if it exists
                                    var completeButton = taskItem.find('button[onclick*="complete_task"]');
                                    if (completeButton.length > 0) {
                                        completeButton.fadeOut();
                                    }
                                }
                            } else {
                                console.log('❌ İlerleme çubuğu bulunamadı');
                            }
                        } else {
                            console.log('❌ Task item bulunamadı, task ID:', taskId);
                            
                            // Fallback: try to find any progress bar near the form
                            var progressBar = form.closest('.bkm-tasks-container').find('.bkm-progress-bar');
                            var progressText = form.closest('.bkm-tasks-container').find('.bkm-progress-text');
                            
                            if (progressBar.length > 0) {
                                console.log('🔄 Fallback yöntemiyle ilerleme güncelleniyor...');
                                
                                progressBar.animate({
                                    width: response.data.new_progress + '%'
                                }, 500);
                                
                                if (progressText.length > 0) {
                                    progressText.text(response.data.new_progress + '%');
                                }
                                
                                progressBar.addClass('progress-updated');
                                setTimeout(function() {
                                    progressBar.removeClass('progress-updated');
                                }, 2000);
                                
                                console.log('✅ Fallback yöntemiyle ilerleme güncellendi');
                            }
                        }
                    }
                    
                    // Update action progress bar if action progress was updated
                    if (response.data.action_progress_updated && response.data.new_action_progress !== undefined && response.data.action_id) {
                        console.log('🎯 Aksiyon ilerlemesi güncelleniyor:', response.data.new_action_progress + '%');
                        updateActionProgress(response.data.action_id, response.data.new_action_progress);
                        showNotification('Not eklendi ve aksiyon ilerlemesi güncellendi: ' + response.data.new_action_progress + '%', 'success');
                    }
                    
                    // Reload notes to show the new note with proper hierarchy
                    loadTaskNotes(taskId, function() {
                        // Ensure notes section is visible
                        var notesSection = $('#notes-' + taskId);
                        if (notesSection.is(':hidden')) {
                            notesSection.slideDown(300);
                        }
                        
                        // Highlight the new note (last main note)
                        var newNote = notesSection.find('.bkm-main-note').last();
                        if (newNote.length > 0) {
                            newNote.addClass('new-note-highlight');
                            
                            // Smooth scroll to the new note
                            setTimeout(function() {
                                $('html, body').animate({
                                    scrollTop: newNote.offset().top - 100
                                }, 500);
                            }, 300);
                            
                            // Remove highlight after animation
                            setTimeout(function() {
                                newNote.removeClass('new-note-highlight');
                            }, 3000);
                        }
                    });
                    
                    // Update notes button count or create the button
                    var notesButton = $('button[onclick="toggleNotes(' + taskId + ')"]');
                    if (notesButton.length > 0) {
                        var currentCount = parseInt(notesButton.text().match(/\d+/)[0] || 0);
                        var newCount = currentCount + 1;
                        notesButton.text('💬 Notları Göster (' + newCount + ')');
                    } else {
                        // Add notes button if it doesn't exist
                        var taskActions = form.closest('.bkm-task-item').find('.bkm-task-actions');
                        if (taskActions.length === 0) {
                            // If no task actions div, look for it in the task container
                            taskActions = form.closest('.bkm-task-item').find('.bkm-task-actions');
                        }
                        if (taskActions.length === 0) {
                            // Create task actions div if it doesn't exist
                            var taskItem = form.closest('.bkm-task-item');
                            taskActions = $('<div class="bkm-task-actions"></div>');
                            taskItem.append(taskActions);
                        }
                        taskActions.append('<button class="bkm-btn bkm-btn-small" onclick="toggleNotes(' + taskId + ')">💬 Notları Göster (1)</button>');
                    }
                    
                    // Hide note form
                    toggleNoteForm(taskId);
                    
                    var message = 'Not başarıyla eklendi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    
                    if (response.data && response.data.progress_updated) {
                        message += ' İlerleme durumu güncellendi: ' + response.data.new_progress + '%';
                    }
                    if (response.data && response.data.action_progress_updated) {
                        message += ' Aksiyon ilerlemesi: ' + response.data.new_action_progress + '%';
                    }
                    console.log('✅ Not başarıyla eklendi:', message);
                    showNotification(message, 'success');
                } else {
                    var errorMessage = 'Not eklenirken hata oluştu.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Not ekleme hatası:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Not ekleme hatası:', error, xhr.responseText);
                
                var errorMsg = 'Bir hata oluştu: ' + error;
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                // Re-enable form
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Not Ekle ve İlerlemeyi Güncelle');
            }
        });
    });
    
    // Cevap formu AJAX - Enhanced error handling
    $(document).on('submit', '.bkm-reply-form', function(e) {
        e.preventDefault();
        console.log('💬 Cevap formu submit edildi');
        
        if (typeof bkmFrontend === 'undefined' || !bkmFrontend.ajax_url) {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            showNotification('WordPress AJAX sistemi hazır değil. Sayfayı yenileyin.', 'error');
            return;
        }
        
        var form = $(this);
        var taskId = form.data('task-id');
        var parentId = form.data('parent-id');
        var content = form.find('textarea[name="note_content"]').val().trim();
        
        console.log('💬 Cevap data:', {
            taskId: taskId,
            parentId: parentId,
            content: content,
            ajax_url: bkmFrontend.ajax_url,
            nonce: bkmFrontend.nonce ? 'MEVCUT' : 'EKSİK'
        });
        
        if (!content) {
            showNotification('Cevap içeriği boş olamaz.', 'error');
            return;
        }
        
        if (!taskId || !parentId) {
            console.error('❌ Task ID veya Parent ID eksik:', { taskId: taskId, parentId: parentId });
            showNotification('Görev ID veya üst not ID eksik.', 'error');
            return;
        }
        
        // Disable form during submission
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('Gönderiliyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            dataType: 'json',
            timeout: 30000,
            data: {
                action: 'bkm_reply_note',
                task_id: taskId,
                parent_note_id: parentId,
                content: content,
                nonce: bkmFrontend.nonce
            },
            success: function(response) {
                console.log('💬 Cevap AJAX yanıtı:', response);
                
                if (response && response.success) {
                    // Clear form and hide it
                    form[0].reset();
                    if (typeof toggleReplyForm === 'function') {
                        toggleReplyForm(taskId, parentId);
                    } else {
                        console.warn('⚠️ toggleReplyForm fonksiyonu bulunamadı');
                        form.hide();
                    }
                    
                    // Reload notes to show the new reply with proper hierarchy
                    if (typeof loadTaskNotes === 'function') {
                        loadTaskNotes(taskId, function() {
                            // Ensure notes section is visible
                            var notesSection = $('#notes-' + taskId);
                            if (notesSection.is(':hidden')) {
                                notesSection.slideDown(300);
                            }
                            
                            // Find and highlight the new reply
                            var parentMainNote = notesSection.find('.bkm-main-note[data-note-id="' + parentId + '"]');
                            if (parentMainNote.length > 0) {
                                // Find the last reply to this parent
                                var newReply = parentMainNote.nextAll('.bkm-reply-note[data-parent-id="' + parentId + '"]').last();
                                if (newReply.length > 0) {
                                    newReply.addClass('new-note-highlight');
                                    
                                    // Smooth scroll to the new reply
                                    setTimeout(function() {
                                        $('html, body').animate({
                                            scrollTop: newReply.offset().top - 100
                                        }, 500);
                                    }, 300);
                                    
                                    // Remove highlight after animation
                                    setTimeout(function() {
                                        newReply.removeClass('new-note-highlight');
                                    }, 3000);
                                }
                            }
                            
                            // Update notes count
                            var notesButton = $('button[onclick="toggleNotes(' + taskId + ')"]');
                            if (notesButton.length > 0) {
                                var currentCount = parseInt(notesButton.text().match(/\d+/)[0] || 0);
                                var newCount = currentCount + 1;
                                notesButton.text('💬 Notları Göster (' + newCount + ')');
                            }
                        });
                    } else {
                        console.warn('⚠️ loadTaskNotes fonksiyonu bulunamadı, sayfa yenileniyor...');
                        setTimeout(function() {
                            window.location.reload();
                        }, 1500);
                    }
                    
                    var message = 'Cevap başarıyla gönderildi!';
                    if (response.data && response.data.message) {
                        message = response.data.message;
                    }
                    console.log('✅ Cevap başarıyla eklendi:', message);
                    showNotification(message, 'success');
                } else {
                    var errorMessage = 'Cevap gönderilirken hata oluştu.';
                    if (response && response.data) {
                        if (typeof response.data === 'string') {
                            errorMessage = response.data;
                        } else if (response.data && response.data.message) {
                            errorMessage = response.data.message;
                        }
                    }
                    console.error('❌ Cevap gönderme hatası:', errorMessage);
                    showNotification(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ Cevap gönderme AJAX hatası:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                
                var errorMsg = 'Cevap gönderilirken hata oluştu.';
                if (xhr.status === 0) {
                    errorMsg = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
                } else if (xhr.status === 403) {
                    errorMsg = 'Yetki hatası. Bu işlemi yapmaya yetkiniz yok.';
                } else if (xhr.status === 404) {
                    errorMsg = 'WordPress AJAX sistemi bulunamadı.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Sunucu hatası oluştu.';
                    try {
                        var responseData = JSON.parse(xhr.responseText);
                        if (responseData && responseData.data && responseData.data.message) {
                            errorMsg += ' Detay: ' + responseData.data.message;
                        }
                    } catch(e) {
                        if (xhr.responseText) {
                            errorMsg += ' Response: ' + xhr.responseText.substring(0, 100);
                        }
                    }
                }
                
                showNotification(errorMsg, 'error');
            },
            complete: function() {
                // Re-enable form
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Cevap Gönder');
            }
        });
    });
    
    // ===== AKSIYON EKLEME İŞLEVLERİ =====
    
    // Aksiyon ekleme formu AJAX - Error handling ile güçlendirilmiş
    // Action formu AJAX handler duplicate kaldırıldı - üstteki handler kullanılıyor
    
    // ===== GÖREV EKLEME AJAX SİSTEMİ =====
    
    // Görev ekleme formu AJAX - Error handling ile güçlendirilmiş
    // Task formu AJAX handler duplicate kaldırıldı - üstteki handler kullanılıyor
    
    // Yeni aksiyonlardaki görev formları için handler (class-based selector)
    $(document).on('submit', '.bkm-task-form-element', function(e) {
        e.preventDefault();
        
        console.log('🚀 Yeni aksiyon görev formu submit edildi');
        
        if (typeof bkmFrontend === 'undefined') {
            console.error('❌ bkmFrontend objesi tanımlanmamış!');
            alert('HATA: WordPress AJAX sistemi yüklenmemiş. Sayfayı yenileyin.');
            return;
        }
        
        var form = $(this);
        var actionId = form.data('action-id');
        var formData = form.serialize();
        
        console.log('📝 Original form data:', formData);
        console.log('📝 Action ID from data-action-id:', actionId);
        
        // Parse form data and ensure correct field mapping
        var params = new URLSearchParams(formData);
        var mappedData = {
            action: 'bkm_add_task',
            nonce: bkmFrontend.nonce,
            action_id: actionId // Always use the action_id from data attribute
        };
        
        // Map form fields to backend expected format
        for (let [key, value] of params) {
            switch(key) {
                case 'aciklama':
                case 'sorumlu_id':
                case 'baslangic_tarihi':
                case 'bitis_tarihi':
                    mappedData[key] = value;
                    break;
                // Handle real form field names from dashboard.php
                case 'task_content':
                    mappedData['aciklama'] = value;
                    break;
                case 'hedef_bitis_tarihi':
                    mappedData['bitis_tarihi'] = value;
                    break;
                // Handle alternative field names
                case 'gorev_aciklama':
                case 'task_aciklama':
                case 'description':
                    mappedData['aciklama'] = value;
                    break;
                case 'sorumlu':
                case 'sorumlu_kisi':
                case 'responsible':
                    mappedData['sorumlu_id'] = value;
                    break;
                case 'baslangic':
                case 'start_date':
                    mappedData['baslangic_tarihi'] = value;
                    break;
                case 'bitis':
                case 'end_date':
                    mappedData['bitis_tarihi'] = value;
                    break;
                default:
                    // Skip action field to avoid conflict
                    if (key !== 'action') {
                        mappedData[key] = value;
                    }
                    break;
            }
        }
        
        console.log('📋 Mapped form data:', mappedData);
        
        // Validate required fields
        var isValid = true;
        var requiredFields = ['action_id', 'aciklama', 'sorumlu_id'];
        
        requiredFields.forEach(function(field) {
            if (!mappedData[field] || mappedData[field].toString().trim() === '') {
                console.error('❌ Missing required field:', field, 'Value:', mappedData[field]);
                isValid = false;
            }
        });
        
        // Also validate form UI elements
        form.find('[required]').each(function() {
            if (!$(this).val()) {
                $(this).addClass('error');
                isValid = false;
            } else {
                $(this).removeClass('error');
            }
        });
        
        if (!isValid) {
            showNotification('Lütfen tüm zorunlu alanları doldurun. (Açıklama, Sorumlu Kişi)', 'error');
            return;
        }
        
        // Disable form during submission
        form.addClass('loading').find('button[type="submit"]').prop('disabled', true).text('Ekleniyor...');
        
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            data: mappedData,
            timeout: 30000,
            success: function(response) {
                console.log('📨 Yeni aksiyon görev AJAX yanıtı:', response);
                
                if (response.success) {
                    // Clear form
                    form[0].reset();
                    
                    // Hide form
                    toggleTaskForm(actionId);
                    
                    // Show success message
                    showNotification(response.data.message, 'success');
                    
                    // Add new task to the action's task list
                    if (response.data.task_html) {
                        addNewTaskToAction(actionId, response.data.task_html);
                    }
                    
                    // Update task count in button
                    updateTaskCount(actionId);
                    
                    // Update action progress if it was updated
                    if (response.data.action_progress_updated && response.data.new_action_progress !== undefined) {
                        console.log('🎯 Aksiyon ilerlemesi güncelleniyor:', response.data.new_action_progress + '%');
                        updateActionProgress(actionId, response.data.new_action_progress);
                        showNotification('Görev eklendi ve aksiyon ilerlemesi güncellendi: ' + response.data.new_action_progress + '%', 'success');
                    }
                } else {
                    showNotification(response.data.message, 'error');
                }
            },
            error: function(xhr, status, error) {
                var errorMessage = 'Bir hata oluştu: ' + error;
                if (xhr.status === 0) {
                    errorMessage = 'Bağlantı hatası: Sunucuya ulaşılamıyor.';
                } else if (xhr.status === 403) {
                    errorMessage = 'Yetki hatası: Bu işlemi yapmaya yetkiniz yok.';
                }
                showNotification(errorMessage, 'error');
            },
            complete: function() {
                // Re-enable form
                form.removeClass('loading').find('button[type="submit"]').prop('disabled', false).text('Görev Ekle');
            }
        });
    });
    
    /**
     * Add new task to action's task list
     */
    function addNewTaskToAction(actionId, taskHtml) {
        var tasksRow = $('#tasks-' + actionId);
        
        if (tasksRow.length === 0) {
            // If tasks row doesn't exist, create it (shouldn't happen normally)
            return;
        }
        
        var tasksContainer = tasksRow.find('.bkm-tasks-container');
        var tasksList = tasksContainer.find('.bkm-tasks-list');
        
        // If no tasks list exists, create it and remove "no tasks" message
        if (tasksList.length === 0) {
            tasksContainer.find('p:contains("henüz görev bulunmamaktadır")').remove();
            tasksList = $('<div class="bkm-tasks-list"></div>');
            tasksContainer.append(tasksList);
        }
        
        // Add new task with enhanced animation
        var newTaskElement = $(taskHtml);
        newTaskElement.hide();
        tasksList.append(newTaskElement);
        
        // Show with slide down animation
        newTaskElement.slideDown(400, function() {
            // Add highlighting animation
            newTaskElement.addClass('new-task-highlight');
            
            // Remove highlight after animation completes
            setTimeout(function() {
                newTaskElement.removeClass('new-task-highlight');
            }, 3000);
            
            // Scroll to the new task with smooth animation
            $('html, body').animate({
                scrollTop: newTaskElement.offset().top - 100
            }, 600, 'swing');
        });
        
        // Update task count in button
        updateTaskCount(actionId);
        
        // If tasks row is not visible, show it
        if (tasksRow.is(':hidden')) {
            tasksRow.slideDown(300);
        }
    }
    
    /**
     * Update task count in the tasks button
     */
    function updateTaskCount(actionId) {
        var tasksButton = $('button[onclick="toggleTasks(' + actionId + ')"]');
        if (tasksButton.length > 0) {
            var currentText = tasksButton.text();
            var match = currentText.match(/\((\d+)\)/);
            if (match) {
                var currentCount = parseInt(match[1]);
                var newCount = currentCount + 1;
                var newText = currentText.replace(/\(\d+\)/, '(' + newCount + ')');
                tasksButton.text(newText);
            }
        }
    }
    
    /**
     * Update action progress bar - Enhanced version
     */
    function updateActionProgress(actionId, newProgress) {
        console.log('🔄 updateActionProgress çağrıldı, actionId:', actionId, 'newProgress:', newProgress + '%');
        
        // Find action progress bars using data-action-id
        var progressBars = $('.bkm-progress[data-action-id="' + actionId + '"]');
        
        // If no data-action-id, try to find in the action row (fallback)
        if (progressBars.length === 0) {
            console.log('⚠️ data-action-id ile bulunamadı, fallback aranıyor...');
            
            // Find the action row and its progress bar
            var actionRows = $('tr').filter(function() {
                var firstCell = $(this).find('td:first').text().trim();
                return firstCell == actionId;
            });
            progressBars = actionRows.find('.bkm-progress');
            console.log('🔍 Fallback ile bulunan progress bar sayısı:', progressBars.length);
        }
        
        console.log('📊 Bulunan aksiyon ilerleme çubukları:', progressBars.length);
        
        if (progressBars.length === 0) {
            console.warn('❌ Aksiyon ' + actionId + ' için ilerleme çubuğu bulunamadı!');
            return;
        }
        
        progressBars.each(function() {
            var progressContainer = $(this);
            var progressBar = progressContainer.find('.bkm-progress-bar');
            var progressText = progressContainer.find('.bkm-progress-text');
            
            console.log('🎯 İlerleme çubuğu güncelleniyor:', {
                actionId: actionId,
                newProgress: newProgress,
                hasBar: progressBar.length > 0,
                hasText: progressText.length > 0
            });
            
            if (progressBar.length > 0) {
                // Store current width for comparison
                var currentWidth = progressBar.css('width');
                var currentPercent = parseInt(currentWidth) || 0;
                
                console.log('📈 İlerleme değişimi:', currentPercent + '% → ' + newProgress + '%');
                
                // Animate progress bar update
                progressBar.animate({
                    width: newProgress + '%'
                }, 800, function() {
                    // Add visual feedback after animation
                    progressBar.addClass('progress-updated');
                    progressContainer.addClass('action-progress-highlight');
                    
                    setTimeout(function() {
                        progressBar.removeClass('progress-updated');
                        progressContainer.removeClass('action-progress-highlight');
                    }, 2500);
                });
                
                if (progressText.length > 0) {
                    progressText.text(newProgress + '%');
                }
                
                console.log('✅ Aksiyon ' + actionId + ' ilerleme çubuğu güncellendi: ' + newProgress + '%');
                
                // If action is completed (100%), add visual indicator
                if (newProgress == 100) {
                    progressContainer.addClass('action-completed');
                    
                    // Show completion celebration
                    setTimeout(function() {
                        progressContainer.append('<div class="completion-badge">🎉 Tamamlandı!</div>');
                        setTimeout(function() {
                            progressContainer.find('.completion-badge').fadeOut();
                        }, 3000);
                    }, 500);
                    
                    console.log('🎉 Aksiyon ' + actionId + ' tamamlandı!');
                    showNotification('🏆 Aksiyon tamamlandı!', 'success');
                }
            } else {
                console.error('❌ İlerleme çubuğu (.bkm-progress-bar) bulunamadı');
            }
        });
    }
    
    // ===== MEVCUT KODLAR =====
    
    // Görev ekleme formu validasyonu (ESKİ - ARTIK KULLANILMIYOR)
    // $('#bkm-task-form form').on('submit', function(e) { ... });

    // Login form validasyonu
    $('.bkm-login-form').on('submit', function(e) {
        var username = $('#log').val();
        var password = $('#pwd').val();
        
        if (!username || !password) {
            e.preventDefault();
            alert('Lütfen kullanıcı adı ve şifre girin.');
            return false;
        }
    });
   
    // Initialize date inputs
    $('input[type="date"]').each(function() {
        if (!$(this).val()) {
            $(this).val(new Date().toISOString().slice(0, 10));
        }
    });
    
    // Form validation (AJAX note formları hariç - bunlar kendi validasyonlarını yapar)
    $('form:not(.bkm-note-form form):not(.bkm-reply-form)').on('submit', function(e) {
        var form = $(this);
        var isValid = true;
        
        // Clear previous error styles
        form.find('.error').removeClass('error');
        
        // Validate required fields
        form.find('input[required], select[required], textarea[required]').each(function() {
            if (!$(this).val().trim()) {
                $(this).addClass('error');
                isValid = false;
            }
        });
        
        // Validate date fields
        form.find('input[type="date"]').each(function() {
            var dateValue = $(this).val();
            if (dateValue && !isValidDate(dateValue)) {
                $(this).addClass('error');
                isValid = false;
            }
        });
        
        // Validate progress percentage
        var progressInput = form.find('input[name="ilerleme_durumu"]');
        if (progressInput.length > 0) {
            var progress = parseInt(progressInput.val());
            if (isNaN(progress) || progress < 0 || progress > 100) {
                progressInput.addClass('error');
                isValid = false;
            }
        }
        
        if (!isValid) {
            e.preventDefault();
            showNotification('Lütfen tüm gerekli alanları doğru şekilde doldurun.', 'error');
            
            // Scroll to first error
            var firstError = form.find('.error').first();
            if (firstError.length > 0) {
                $('html, body').animate({
                    scrollTop: firstError.offset().top - 100
                }, 500);
                firstError.focus();
            }
            
            return false;
        }
    });
    
    // Progress bar real-time update
    $('input[name="ilerleme_durumu"]').on('input', function() {
        var value = $(this).val();
        var progressBar = $(this).closest('.bkm-field').find('.bkm-progress-bar');
        if (progressBar.length > 0) {
            progressBar.css('width', value + '%');
        }
    });
    
    // Auto-hide notifications
    $('.bkm-success, .bkm-error').each(function() {
        var notification = $(this);
        setTimeout(function() {
            notification.fadeOut();
        }, 5000);
    });
    
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = $($(this).attr('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 500);
        }
    });
    
    // Task completion confirmation
    $('.bkm-btn-success[onclick*="confirm"]').on('click', function(e) {
        e.preventDefault();
        
        var form = $(this).closest('form');
        var taskContent = $(this).closest('.bkm-task-item').find('.bkm-task-content p strong').text();
        
        if (confirm('Bu görevi tamamladınız mı?\n\n"' + taskContent + '"')) {
            form.submit();
        }
    });
    
    // Table sorting
    $('.bkm-table th[data-sort]').on('click', function() {
        var table = $(this).closest('table');
        var column = $(this).data('sort');
        var order = $(this).hasClass('asc') ? 'desc' : 'asc';
        
        // Remove existing sort classes
        table.find('th').removeClass('asc desc');
        $(this).addClass(order);
        
        sortTable(table, column, order);
    });
    
    // Search functionality
    $('#bkm-search').on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();
        
        $('.bkm-table tbody tr').each(function() {
            var row = $(this);
            var text = row.text().toLowerCase();
            
            if (text.indexOf(searchTerm) > -1) {
                row.show();
            } else {
                row.hide();
            }
        });
    });
    
    // Filter functionality
    $('.bkm-filter-select').on('change', function() {
        // Get all filter values
        var tanimlayan = $('#filter-tanimlayan').val();
        var sorumlu = $('#filter-sorumlu').val();
        var kategori = $('#filter-kategori').val();
        var onem = $('#filter-onem').val();
        var durum = $('#filter-durum').val();

        $('.bkm-table tbody tr').each(function() {
            var row = $(this);
            var match = true;

            if (tanimlayan && row.data('tanimlayan') != tanimlayan) match = false;
            if (sorumlu && (!row.data('sorumlu') || row.data('sorumlu').split(',').indexOf(sorumlu) === -1)) match = false;
            if (kategori && row.data('kategori') != kategori) match = false;
            if (onem && row.data('onem') != onem) match = false;
            if (durum && row.data('durum') != durum) match = false;

            if (match) {
                row.show();
            } else {
                row.hide();
            }
        });

        // Filtrelerden herhangi biri 'Tümü' ise, tüm detay ve görev formlarını kapat
        if (!tanimlayan && !sorumlu && !kategori && !onem && !durum) {
            $('.bkm-action-details-row:visible').slideUp();
            $('.bkm-tasks-row:visible').slideUp();
        }
    });
    
    // Real-time character counter for textareas
    $('textarea[maxlength]').each(function() {
        var textarea = $(this);
        var maxLength = textarea.attr('maxlength');
        var counter = $('<div class="char-counter">' + textarea.val().length + '/' + maxLength + '</div>');
        
        textarea.after(counter);
        
        textarea.on('input', function() {
            var currentLength = $(this).val().length;
            counter.text(currentLength + '/' + maxLength);
            
            if (currentLength > maxLength * 0.9) {
                counter.addClass('warning');
            } else {
                counter.removeClass('warning');
            }
        });
    });
    
    // Mobile menu toggle
    $('.bkm-mobile-menu-toggle').on('click', function() {
        $('.bkm-mobile-menu').slideToggle();
    });
    
    // Responsive table handling
    function makeTablesResponsive() {
        $('.bkm-table').each(function() {
            var table = $(this);
            if (!table.parent().hasClass('table-responsive')) {
                table.wrap('<div class="table-responsive"></div>');
            }
        });
    }
    
    makeTablesResponsive();
    
    // Helper functions
    function isValidDate(dateString) {
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regEx)) return false;
        var d = new Date(dateString);
        var dNum = d.getTime();
        if (!dNum && dNum !== 0) return false;
        return d.toISOString().slice(0, 10) === dateString;
    }
    
    // showNotification fonksiyonu global scope'a taşındı
    
    function sortTable(table, column, order) {
        var tbody = table.find('tbody');
        var rows = tbody.find('tr').toArray();
        
        rows.sort(function(a, b) {
            var aValue = $(a).find('[data-sort="' + column + '"]').text().trim();
            var bValue = $(b).find('[data-sort="' + column + '"]').text().trim();
            
            // Try to parse as numbers
            var aNum = parseFloat(aValue);
            var bNum = parseFloat(bValue);
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return order === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // Parse as dates
            var aDate = new Date(aValue);
            var bDate = new Date(bValue);
            
            if (!isNaN(aDate) && !isNaN(bDate)) {
                return order === 'asc' ? aDate - bDate : bDate - aDate;
            }
            
            // String comparison
            if (order === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
        
        tbody.empty().append(rows);
    }
    
    // Helper function to add new action to table
    function addNewActionToTable(actionHtml) {
        var tableBody = $('.bkm-table tbody');
        var newRow;
        
        // Check if "no actions" message exists
        var noActionsRow = tableBody.find('td:contains("Henüz aksiyon bulunmamaktadır")').closest('tr');
        
        if (noActionsRow.length > 0) {
            // Replace "no actions" message with new action
            noActionsRow.replaceWith(actionHtml);
            newRow = tableBody.find('tr').first();
        } else {
            // Prepend new action to the top of the table
            tableBody.prepend(actionHtml);
            newRow = tableBody.find('tr').first();
        }
        
        // Add highlight animation to the new row
        newRow.addClass('new-action-row');
        
        // Improved scroll to new action
        setTimeout(function() {
            if (newRow.length && newRow.is(':visible')) {
                // Get the table element for reference
                var table = $('.bkm-table');
                var tableOffset = table.offset();
                
                if (tableOffset) {
                    // Calculate the position of the new row within the table
                    var rowOffset = newRow.offset();
                    var targetPosition = rowOffset.top - 120; // 120px from top for better visibility
                    
                    // Ensure we don't scroll above the table
                    var minPosition = tableOffset.top - 50;
                    targetPosition = Math.max(minPosition, targetPosition);
                    
                    // Use a different scroll method for better reliability
                    $('html, body').stop().animate({
                        scrollTop: targetPosition
                    }, {
                        duration: 1200,
                        easing: 'swing',
                        complete: function() {
                            // Flash effect after scroll completes
                            newRow.fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);
                        }
                    });
                } else {
                    // Fallback: scroll to top of page
                    $('html, body').animate({ scrollTop: 0 }, 800);
                }
            }
        }, 400); // Increased delay for DOM to fully update
        
        // Remove highlight after animation
        setTimeout(function() {
            newRow.removeClass('new-action-row');
        }, 5000);
    }
    
    // Helper function to update task form action dropdown
    function updateTaskFormActionDropdown(actionId, actionDetails) {
        var actionSelect = $('#action_id');
        
        if (actionSelect.length === 0) {
            console.log('⚠️ updateTaskFormActionDropdown: Aksiyon dropdown bulunamadı');
            return;
        }
        
        // Create new option element
        var optionText = '#' + actionId + ' - ' + (actionDetails.tespit_konusu || actionDetails.title || '');
        var newOption = $('<option></option>')
            .attr('value', actionId)
            .text(optionText);
        
        // Check if option already exists
        if (actionSelect.find('option[value="' + actionId + '"]').length === 0) {
            // Add new option after the first "Seçiniz..." option
            actionSelect.find('option:first').after(newOption);
            
            // Highlight the new option temporarily
            newOption.addClass('new-option');
            setTimeout(function() {
                newOption.removeClass('new-option');
            }, 3000);
            
            console.log('✅ Yeni aksiyon görev dropdown\'ına eklendi:', optionText);
            showNotification('Yeni aksiyon görev formunda da görüntülendi!', 'success');
        }
    }

    // AJAX functionality
    if (typeof bkmFrontend !== 'undefined') {
        
        // Auto-save form data to localStorage (aksiyon formu hariç)
        $('form input, form select, form textarea').not('#bkm-action-form-element input, #bkm-action-form-element select, #bkm-action-form-element textarea').on('change input', function() {
            var form = $(this).closest('form');
            var formId = form.attr('id') || 'bkm-form';
            
            // Skip action form auto-save to prevent conflicts
            if (formId === 'bkm-action-form-element') {
                return;
            }
            
            var formData = form.serialize();
            localStorage.setItem('bkm_form_data_' + formId, formData);
        });
        
        // Restore form data from localStorage (aksiyon formu hariç)
        $('form').not('#bkm-action-form-element').each(function() {
            var form = $(this);
            var formId = form.attr('id') || 'bkm-form';
            var savedData = localStorage.getItem('bkm_form_data_' + formId);
            
            if (savedData) {
                var params = new URLSearchParams(savedData);
                params.forEach(function(value, key) {
                    var field = form.find('[name="' + key + '"]');
                    if (field.length > 0) {
                        if (field.is('select')) {
                            field.val(value);
                        } else if (field.is('input[type="checkbox"]') || field.is('input[type="radio"]')) {
                            if (field.val() === value) {
                                field.prop('checked', true);
                            }
                        } else {
                            field.val(value);
                        }
                    }
                });
            }
        });
        
        // Clear saved form data on successful submission (aksiyon formu hariç - manuel yönetim)
        $('form').not('#bkm-action-form-element').on('submit', function() {
            var formId = $(this).attr('id') || 'bkm-form';
            localStorage.removeItem('bkm_form_data_' + formId);
        });
    }
    
    // Accessibility improvements
    $('input, select, textarea').on('focus', function() {
        $(this).closest('.bkm-field').addClass('focused');
    }).on('blur', function() {
        $(this).closest('.bkm-field').removeClass('focused');
    });
    
    // Keyboard navigation
    $(document).on('keydown', function(e) {
        // ESC to close modals/forms
        if (e.key === 'Escape') {
            $('.bkm-task-form:visible').hide();
            $('.bkm-tasks-row:visible').hide();
        }
        
        // Enter to submit forms (if not in textarea)
        if (e.key === 'Enter' && !$(e.target).is('textarea')) {
            var form = $(e.target).closest('form');
            if (form.length > 0) {
                e.preventDefault();
                form.submit();
            }
        }
    });
    
    // Performance optimization: Lazy load images
    $('img[data-src]').each(function() {
        var img = $(this);
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var lazyImg = $(entry.target);
                    lazyImg.attr('src', lazyImg.data('src'));
                    lazyImg.removeAttr('data-src');
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(this);
    });
    
    // Aksiyon formu sorumlu kişiler multi-select fix
    $(document).on('change', '#action_sorumlu_ids', function(e) {
        console.log('🔧 Sorumlu kişiler seçimi değişti:', $(this).val());
        // Prevent auto-clear by stopping any conflicting events
        e.stopPropagation();
        
        // Store the selection to prevent loss
        var selectedValues = $(this).val() || [];
        $(this).data('selected-values', selectedValues);
        
        // Update visual feedback
        $(this).attr('title', selectedValues.length + ' kişi seçildi');
    });
    
    // Prevent multi-select from losing selection on blur
    $(document).on('blur', '#action_sorumlu_ids', function(e) {
        var storedValues = $(this).data('selected-values');
        if (storedValues && storedValues.length > 0) {
            // Restore selection if it was cleared
            setTimeout(() => {
                if (!$(this).val() || $(this).val().length === 0) {
                    $(this).val(storedValues);
                    console.log('🔄 Sorumlu kişiler seçimi geri yüklendi:', storedValues);
                }
            }, 100);
        }
    });
});

// Global functions
window.toggleTaskForm = function() {
    console.log('🔧 toggleTaskForm çağrıldı');
    var form = jQuery('#bkm-task-form');
    var isVisible = form.is(':visible');
    
    if (isVisible) {
        // Form kapanıyorsa sadece kapat (görev formu otomatik temizleme zaten yapılıyor)
        form.slideUp();
        console.log('📝 Görev formu kapatıldı');
    } else {
        // Form açılıyorsa diğer formları kapat
        jQuery('#bkm-action-form, #bkm-settings-panel').slideUp();
        form.slideDown();
        console.log('📝 Görev formu açıldı');
    }
}

// Parametreli task form toggle fonksiyonu (yeni aksiyonlar için)
window.toggleTaskForm = function(actionId) {
    if (actionId) {
        console.log('🔧 toggleTaskForm çağrıldı, actionId:', actionId);
        var form = jQuery('#task-form-' + actionId);
        var isVisible = form.is(':visible');
        
        if (isVisible) {
            form.slideUp();
            console.log('📝 Görev formu kapatıldı, actionId:', actionId);
        } else {
            // Diğer task formlarını kapat
            jQuery('.bkm-task-form').slideUp();
            form.slideDown();
            console.log('📝 Görev formu açıldı, actionId:', actionId);
        }
    } else {
        // Eski toggle fonksiyonu (parametresiz)
        console.log('🔧 toggleTaskForm çağrıldı (eski versiyon)');
        var form = jQuery('#bkm-task-form');
        var isVisible = form.is(':visible');
        
        if (isVisible) {
            form.slideUp();
            console.log('📝 Görev formu kapatıldı');
        } else {
            jQuery('#bkm-action-form, #bkm-settings-panel').slideUp();
            form.slideDown();
            console.log('📝 Görev formu açıldı');
        }
    }
}

window.toggleActionForm = function() {
    console.log('🔧 toggleActionForm çağrıldı');
    var form = jQuery('#bkm-action-form');
    var isVisible = form.is(':visible');
    
    if (isVisible) {
        // Form kapanıyorsa temizle
        form.slideUp();
        if (typeof clearActionForm === 'function') {
            clearActionForm();
        }
        console.log('📝 Aksiyon formu kapatıldı');
    } else {
        // Form açılıyorsa diğer formları kapat
        jQuery('#bkm-task-form, #bkm-settings-panel').slideUp();
        form.slideDown();
        console.log('📝 Aksiyon formu açıldı');
    }
}

function clearActionForm() {
    var form = jQuery('#bkm-action-form-element');
    
    if (form.length === 0) {
        console.log('⚠️ clearActionForm: Form bulunamadı');
        return;
    }
    
    // Reset form completely but preserve the structure
    form[0].reset();
    
    // Remove any error classes
    form.find('.error').removeClass('error');
    
    // Clear multi-select specifically (but don't override user selections)
    // Only clear when form is actually being reset after submission
    var multiSelect = form.find('#action_sorumlu_ids');
    if (multiSelect.length > 0) {
        multiSelect.val([]).trigger('change');
    }
    
    // Set default date to tomorrow
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    form.find('#action_hedef_tarih').val(tomorrow.toISOString().slice(0, 10));
    
    // Reset all field borders to normal
    form.find('input, select, textarea').css('border-color', '');
    
    // Clear saved form data to prevent conflicts
    var formId = form.attr('id') || 'bkm-action-form-element';
    localStorage.removeItem('bkm_form_data_' + formId);
    
    console.log('🧹 Aksiyon formu temizlendi (global function)');
}

// Global fonksiyonları window objesine ekle
window.clearActionForm = clearActionForm;
window.loadUsers = loadUsers;
window.handleUserFormSubmit = handleUserFormSubmit;

window.toggleTasks = function(actionId) {
    console.log('🔧 toggleTasks çağrıldı, actionId:', actionId);
    var tasksRow = jQuery('#tasks-' + actionId);
    console.log('📝 Tasks row bulundu:', tasksRow.length);
    
    if (tasksRow.length > 0) {
        tasksRow.slideToggle();
    } else {
        console.error('❌ Tasks row bulunamadı, ID:', '#tasks-' + actionId);
        showNotification('Görevler bölümü bulunamadı.', 'error');
    }
}

window.toggleActionDetails = function(actionId) {
    console.log('🔧 toggleActionDetails çağrıldı, actionId:', actionId);
    var detailsRow = jQuery('#details-' + actionId);
    var isVisible = detailsRow.is(':visible');
    
    console.log('📋 Details row bulundu:', detailsRow.length, 'Görünür:', isVisible);
    
    if (isVisible) {
        // Detaylar açıksa kapat
        detailsRow.slideUp();
        console.log('📤 Detaylar kapatıldı');
    } else {
        // Detaylar kapalıysa aç ve diğer detayları kapat
        jQuery('.bkm-action-details-row:visible').slideUp();
        detailsRow.slideDown();
        console.log('📥 Detaylar açıldı');
        
        // Smooth scroll to details
        setTimeout(function() {
            jQuery('html, body').animate({
                scrollTop: detailsRow.offset().top - 100
            }, 500);
        }, 300);
    }
}

function bkmPrintTable() {
    var printContents = jQuery('.bkm-table').clone();
    var originalContents = document.body.innerHTML;
    
    document.body.innerHTML = '<table class="bkm-table">' + printContents.html() + '</table>';
    window.print();
    document.body.innerHTML = originalContents;
    location.reload();
}

/**
 * Show notification message to user
 */
window.showNotification = function(message, type) {
    // Modern AJAX notification system
    var notificationClass = type === 'error' ? 'error' : 'success';
    var notification = jQuery('<div class="bkm-ajax-notification ' + notificationClass + '">' + 
                        '<span>' + message + '</span>' +
                        '<button class="close-btn" onclick="jQuery(this).parent().removeClass(\'show\')">&times;</button>' +
                        '</div>');
    
    // Remove existing notifications
    jQuery('.bkm-ajax-notification').remove();
    
    // Add to body
    jQuery('body').append(notification);
    
    // Show with animation
    setTimeout(function() {
        notification.addClass('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(function() {
        notification.removeClass('show');
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===== YENİ GÖREV NOTLARI FONKSİYONLARI =====

/**
 * Toggle note form visibility
 */
window.toggleNoteForm = function(taskId) {
    console.log('🔧 toggleNoteForm çağrıldı, taskId:', taskId);
    var noteForm = jQuery('#note-form-' + taskId);
    console.log('📝 Note form bulundu:', noteForm.length);
    
    if (noteForm.length > 0) {
        if (noteForm.is(':visible')) {
            noteForm.slideUp(300);
        } else {
            // Close other note forms first
            jQuery('.bkm-note-form:visible').slideUp(300);
            noteForm.slideDown(300, function() {
                noteForm.find('textarea').focus();
            });
        }
    } else {
        console.error('❌ Not formu bulunamadı, ID:', '#note-form-' + taskId);
    }
};
    
/**
 * Toggle notes section visibility
 */
window.toggleNotes = function(taskId) {
    console.log('🔧 toggleNotes çağrıldı, taskId:', taskId);
    var notesSection = jQuery('#notes-' + taskId);
    console.log('💬 Notes section bulundu:', notesSection.length, 'Visible:', notesSection.is(':visible'));
    
    if (notesSection.length > 0) {
        if (notesSection.is(':visible')) {
            console.log('📁 Notlar gizleniyor...');
            notesSection.slideUp(300);
        } else {
            console.log('📂 Notlar gösteriliyor, önce yükleniyor...');
            // Load notes first, then show
            loadTaskNotes(taskId, function() {
                console.log('✅ Notlar yüklendi, slideDown çalıştırılıyor...');
                notesSection.slideDown(300, function() {
                    console.log('✅ slideDown tamamlandı');
                });
            });
        }
    } else {
        console.error('❌ Notlar bölümü bulunamadı, ID:', '#notes-' + taskId);
        // Debug: bulmaya çalış
        console.log('🔍 Mevcut notes elementleri:', jQuery('[id*="notes-"]').length);
        jQuery('[id*="notes-"]').each(function() {
            console.log('📄 Bulunan notes elementi:', this.id);
        });
    }
};
    
/**
 * Load task notes via AJAX
 */
window.loadTaskNotes = function(taskId, callback) {
    console.log('🔄 Loading notes for task:', taskId);
    
    // Check if bkmFrontend is available
    if (typeof bkmFrontend === 'undefined') {
        console.error('❌ bkmFrontend objesi tanımlanmamış!');
        showNotification('WordPress AJAX sistemi yüklenmedi.', 'error');
        return;
    }
    
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_get_notes', // Changed from bkm_get_task_notes to bkm_get_notes
            task_id: taskId,
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            console.log('📨 Task notes response:', response);
            
            if (response.success) {
                var notesContainer = jQuery('#notes-' + taskId + ' .bkm-notes-content');
                var isDirectContainer = notesContainer.length > 0;
                
                if (!isDirectContainer) {
                    notesContainer = jQuery('#notes-' + taskId);
                }
                
                console.log('🎯 Notes container found:', notesContainer.length, 'Direct container:', isDirectContainer);
                
                // Fixed data structure - backend returns {notes: [...]}
                var notes = response.data.notes || response.data || [];
                console.log('📝 Retrieved notes count:', notes.length);
                
                if (notes && notes.length > 0) {
                    var notesHtml = '';
                    
                    // Add wrapper div only if we're targeting the main container (not .bkm-notes-content)
                    if (!isDirectContainer) {
                        notesHtml += '<div class="bkm-notes-content">';
                    }
                    
                    // Build hierarchical HTML - backend already provides replies for each note
                    notes.forEach(function(note) {
                        // Main note
                        notesHtml += '<div class="bkm-note-item bkm-main-note" data-note-id="' + note.id + '">';
                        notesHtml += '<div class="bkm-note-indicator"></div>';
                        notesHtml += '<div class="bkm-note-content-wrapper">';
                        notesHtml += '<div class="bkm-note-meta">';
                        notesHtml += '<span class="bkm-note-author">👤 ' + (note.author_name || 'Bilinmeyen') + '</span>';
                        notesHtml += '<span class="bkm-note-date">📅 ' + (note.created_at || 'Tarih yok') + '</span>';
                        notesHtml += '</div>';
                        notesHtml += '<div class="bkm-note-content">' + (note.content || '[İçerik yok]') + '</div>';
                        notesHtml += '<div class="bkm-note-actions">';
                        notesHtml += '<button class="bkm-btn bkm-btn-small bkm-btn-secondary" onclick="toggleReplyForm(' + taskId + ', ' + note.id + ')">💬 Notu Cevapla</button>';
                        notesHtml += '</div>';
                        notesHtml += '<div id="reply-form-' + taskId + '-' + note.id + '" class="bkm-note-form" style="display: none;">';
                        notesHtml += '<form class="bkm-reply-form" data-task-id="' + taskId + '" data-parent-id="' + note.id + '">';
                        notesHtml += '<textarea name="note_content" rows="3" placeholder="Cevabınızı buraya yazın..." required></textarea>';
                        notesHtml += '<div class="bkm-form-actions">';
                        notesHtml += '<button type="submit" class="bkm-btn bkm-btn-primary bkm-btn-small">Cevap Gönder</button>';
                        notesHtml += '<button type="button" class="bkm-btn bkm-btn-secondary bkm-btn-small" onclick="toggleReplyForm(' + taskId + ', ' + note.id + ')">İptal</button>';
                        notesHtml += '</div>';
                        notesHtml += '</form>';
                        notesHtml += '</div>';
                        notesHtml += '</div>';
                        notesHtml += '</div>';
                        
                        // Replies to this note (from backend response)
                        if (note.replies && note.replies.length > 0) {
                            note.replies.forEach(function(reply) {
                                notesHtml += '<div class="bkm-note-item bkm-reply-note" data-note-id="' + reply.id + '" data-parent-id="' + note.id + '">';
                                notesHtml += '<div class="bkm-reply-connector"></div>';
                                notesHtml += '<div class="bkm-reply-arrow">↳</div>';
                                notesHtml += '<div class="bkm-note-content-wrapper">';
                                notesHtml += '<div class="bkm-note-meta">';
                                notesHtml += '<span class="bkm-note-author">👤 ' + (reply.author_name || 'Bilinmeyen') + '</span>';
                                notesHtml += '<span class="bkm-note-date">📅 ' + (reply.created_at || 'Tarih yok') + '</span>';
                                notesHtml += '<span class="bkm-reply-badge">Cevap</span>';
                                notesHtml += '</div>';
                                notesHtml += '<div class="bkm-note-content">' + (reply.content || '[İçerik yok]') + '</div>';
                                notesHtml += '</div>';
                                notesHtml += '</div>';
                            });
                        }
                    });
                    
                    // Close wrapper div only if we added it
                    if (!isDirectContainer) {
                        notesHtml += '</div>';
                    }
                    
                    notesContainer.html(notesHtml);
                    console.log('✅ Notes HTML updated successfully');
                } else {
                    var emptyHtml = '<p style="text-align: center; color: #9e9e9e; font-style: italic; margin: 20px 0; padding: 30px; border: 2px dashed #e0e0e0; border-radius: 12px;">📝 Bu görev için henüz not bulunmamaktadır.</p>';
                    
                    if (!isDirectContainer) {
                        emptyHtml = '<div class="bkm-notes-content">' + emptyHtml + '</div>';
                    }
                    
                    notesContainer.html(emptyHtml);
                    console.log('📝 Empty notes message displayed');
                }
                
                if (callback) callback();
            } else {
                var errorMessage = 'Notlar yüklenirken hata oluştu.';
                if (response && response.data) {
                    if (typeof response.data === 'string') {
                        errorMessage = response.data;
                    } else if (response.data && response.data.message) {
                        errorMessage = response.data.message;
                    }
                }
                console.error('❌ Failed to load task notes:', errorMessage);
                showNotification(errorMessage, 'error');
            }
        },
        error: function(xhr, status, error) {
            console.error('💥 AJAX error loading task notes:', error);
            showNotification('Notlar yüklenirken bağlantı hatası oluştu.', 'error');
            if (callback) callback();
        }
    });
}

/**
 * Toggle reply form visibility for a specific note
 */
window.toggleReplyForm = function(taskId, noteId) {
    console.log('🔧 toggleReplyForm çağrıldı, taskId:', taskId, 'noteId:', noteId);
    var replyForm = jQuery('#reply-form-' + taskId + '-' + noteId);
    console.log('💬 Reply form bulundu:', replyForm.length);
    
    if (replyForm.length > 0) {
        if (replyForm.is(':visible')) {
            replyForm.slideUp(300);
        } else {
            // Close other reply forms first
            jQuery('.bkm-note-form:visible').slideUp(300);
            replyForm.slideDown(300, function() {
                replyForm.find('textarea').focus();
            });
        }
    } else {
        console.error('❌ Cevap formu bulunamadı, ID:', '#reply-form-' + taskId + '-' + noteId);
    }
};

// Service Worker devre dışı - sw.js dosyası mevcut değil
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js').then(function(registration) {
//         console.log('ServiceWorker registration successful');
//     }).catch(function(err) {
//         console.log('ServiceWorker registration failed');
//     });
// }

// ===== YÖNETİM PANELLERİ (KATEGORİLER & PERFORMANSLAR) =====
    
    // Kategoriler paneli toggle (eski - artık kullanılmıyor)
    function toggleCategoriesPanel() {
        // Yeni sistemde ayarlar panelini aç ve kategori tab'ını göster
        toggleSettingsPanel();
        setTimeout(function() {
            switchSettingsTab('categories');
        }, 100);
    }
    
    // Performanslar paneli toggle (eski - artık kullanılmıyor)
    function togglePerformancesPanel() {
        // Yeni sistemde ayarlar panelini aç ve performans tab'ını göster
        toggleSettingsPanel();
        setTimeout(function() {
            switchSettingsTab('performances');
        }, 100);
    }
    
    // Kategori formu temizle
    function clearCategoryForm() {
        var form = $('#bkm-category-form-element');
        form[0].reset();
        form.find('button[type="submit"]').text('Kategori Ekle');
        form.removeData('edit-id');
    }
    
    // Performans formu temizle
    function clearPerformanceForm() {
        var form = $('#bkm-performance-form-element');
        form[0].reset();
        form.find('button[type="submit"]').text('Performans Ekle');
        form.removeData('edit-id');
    }
    
    // Kategori düzenle
    function editCategory(id, name, description) {
        var form = $('#bkm-category-form-element');
        form.find('#category_name').val(name);
        form.find('#category_description').val(description);
        form.find('button[type="submit"]').text('Kategori Güncelle');
        form.data('edit-id', id);
        
        // Form alanını highlight et
        form.find('#category_name').focus();
    }
    
    // Performans düzenle  
    function editPerformance(id, name, description) {
        var form = $('#bkm-performance-form-element');
        form.find('#performance_name').val(name);
        form.find('#performance_description').val(description);
        form.find('button[type="submit"]').text('Performans Güncelle');
        form.data('edit-id', id);
        
        // Form alanını highlight et
        form.find('#performance_name').focus();
    }
    
    // Kategori sil
    
    // Kategori formu AJAX handler duplicate kaldırıldı - üstteki handler kullanılıyor
    
    // Performans formu AJAX - Error handling ile güçlendirilmiş
    // Performans formu AJAX handler duplicate kaldırıldı - üstteki handler kullanılıyor
    
    // Yeni kategori listeye ekle
    function addCategoryToList(category) {
        var html = '<div class="bkm-item" data-id="' + category.id + '">' +
                   '<div class="bkm-item-content">' +
                   '<strong>' + escapeHtml(category.name) + '</strong>';
        
        if (category.description) {
            html += '<p>' + escapeHtml(category.description) + '</p>';
        }
        
        html += '</div>' +
                '<div class="bkm-item-actions">' +
                '<button class="bkm-btn bkm-btn-small bkm-btn-info" onclick="editCategory(' + category.id + ', \'' + 
                escapeJs(category.name) + '\', \'' + escapeJs(category.description || '') + '\')">Düzenle</button>' +
                '<button class="bkm-btn bkm-btn-small bkm-btn-danger" onclick="deleteCategory(' + category.id + ')">Sil</button>' +
                '</div></div>';
        
        $('#categories-list').prepend(html);
    }
    
    // Yeni performans listeye ekle
    function addPerformanceToList(performance) {
        var html = '<div class="bkm-item" data-id="' + performance.id + '">' +
                   '<div class="bkm-item-content">' +
                   '<strong>' + escapeHtml(performance.name) + '</strong>';
        
        if (performance.description) {
            html += '<p>' + escapeHtml(performance.description) + '</p>';
        }
        
        html += '</div>' +
                '<div class="bkm-item-actions">' +
                '<button class="bkm-btn bkm-btn-small bkm-btn-info" onclick="editPerformance(' + performance.id + ', \'' + 
                escapeJs(performance.name) + '\', \'' + escapeJs(performance.description || '') + '\')">Düzenle</button>' +
                '<button class="bkm-btn bkm-btn-small bkm-btn-danger" onclick="deletePerformance(' + performance.id + ')">Sil</button>' +
                '</div></div>';
        
        $('#performances-list').prepend(html);
    }
    
    // Helper functions
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, function(m) { return map[m]; }) : '';
    }
    
    function escapeJs(text) {
        return text ? text.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
    }
    
    // Dropdown refresh fonksiyonları
    function refreshCategoryDropdown() {
        console.log('🔄 Kategori dropdown ve liste yenileniyor...');
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            data: {
                action: 'bkm_get_categories',
                nonce: bkmFrontend.nonce
            },
            success: function(response) {
                console.log('📂 Kategori listesi yanıtı:', response);
                if (response.success) {
                    // Update action form dropdown
                    var actionSelect = $('#action_kategori_id');
                    if (actionSelect.length > 0) {
                        var selectedValue = actionSelect.val();
                        actionSelect.empty();
                        actionSelect.append('<option value="">Seçiniz...</option>');
                        
                        $.each(response.data.categories, function(index, category) {
                            actionSelect.append('<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>');
                        });
                        
                        if (selectedValue) {
                            actionSelect.val(selectedValue);
                        }
                    }
                    
                    // Update other category dropdowns (if any)
                    var categorySelects = $('select[name="kategori_id"]:not(#action_kategori_id)');
                    categorySelects.each(function() {
                        var selectedValue = $(this).val();
                        $(this).empty();
                        $(this).append('<option value="">Kategori Seçin</option>');
                        
                        $.each(response.data.categories, function(index, category) {
                            $(this).append('<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>');
                        }.bind(this));
                        
                        if (selectedValue) {
                            $(this).val(selectedValue);
                        }
                    });
                    
                    // Update category list display
                    refreshCategoryList(response.data.categories);
                    
                    // Update filter dropdowns too
                    var filterSelect = $('#filter-kategori');
                    if (filterSelect.length > 0) {
                        var selectedValue = filterSelect.val();
                        filterSelect.empty();
                        filterSelect.append('<option value="">Tüm Kategoriler</option>');
                        
                        $.each(response.data.categories, function(index, category) {
                            filterSelect.append('<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>');
                        });
                        
                        if (selectedValue) {
                            filterSelect.val(selectedValue);
                        }
                    }
                    
                    console.log('✅ Kategori dropdown ve liste güncellendi');
                }
            },
            error: function() {
                console.error('❌ Kategori listesi güncellenirken hata oluştu');
            }
        });
    }
    
    function refreshCategoryList(categories) {
        console.log('🔄 Kategori listesi güncelleniyor...', categories);
        var categoriesList = $('#categories-list');
        
        if (categoriesList.length === 0) {
            console.log('⚠️ categories-list elementi bulunamadı');
            return;
        }
        
        console.log('✅ categories-list elementi bulundu, mevcut içerik temizleniyor...');
        
        // Clear existing list
        categoriesList.empty();
        
        if (!categories || categories.length === 0) {
            categoriesList.html('<div class="bkm-no-items">Henüz kategori eklenmemiş.</div>');
            console.log('📝 Kategori listesi boş - bilgi mesajı eklendi');
            return;
        }
        
        console.log('📋 ' + categories.length + ' kategori HTML olarak ekleniyor...');
        
        // Add each category to the list
        $.each(categories, function(index, category) {
            console.log('➕ Kategori ekleniyor:', category.name);
            
            var categoryItem = $('<div class="bkm-item"></div>').attr('data-id', category.id);
            var categoryContent = $('<div class="bkm-item-content"></div>');
            var categoryTitle = $('<strong></strong>').text(category.name);
            
            categoryContent.append(categoryTitle);
            
            if (category.description && category.description.trim()) {
                var categoryDesc = $('<p></p>').text(category.description);
                categoryContent.append(categoryDesc);
            }
            
            var categoryActions = $('<div class="bkm-item-actions"></div>');
            var editButton = $('<button class="bkm-btn bkm-btn-small bkm-btn-info">✏️ Düzenle</button>');
            
            // Safe attribute binding for edit button
            editButton.on('click', function() {
                if (typeof window.editCategory === 'function') {
                    window.editCategory(category.id, category.name, category.description || '');
                }
            });
            
            categoryActions.append(editButton);
            categoryItem.append(categoryContent).append(categoryActions);
            categoriesList.append(categoryItem);
        });
        
        console.log('✅ Kategori listesi güncellendi, ' + categories.length + ' kategori gösteriliyor');
    }
    
    function refreshPerformanceDropdown() {
        console.log('🔄 Performans dropdown ve liste yenileniyor...');
        $.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            data: {
                action: 'bkm_get_performances',
                nonce: bkmFrontend.nonce
            },
            success: function(response) {
                console.log('🎯 Performans listesi yanıtı:', response);
                if (response.success) {
                    // Update performance list display
                    refreshPerformanceList(response.data.performances);
                    
                    console.log('✅ Performans listesi güncellendi');
                }
            },
            error: function() {
                console.error('❌ Performans listesi güncellenirken hata oluştu');
            }
        });
    }
    
    function refreshPerformanceList(performances) {
        console.log('🔄 Performans listesi güncelleniyor...', performances);
        var performancesList = $('#performances-list');
        
        if (performancesList.length === 0) {
            console.log('⚠️ performances-list elementi bulunamadı');
            return;
        }
        
        console.log('✅ performances-list elementi bulundu, mevcut içerik temizleniyor...');
        
        // Clear existing list
        performancesList.empty();
        
        if (!performances || performances.length === 0) {
            performancesList.html('<div class="bkm-no-items">Henüz performans eklenmemiş.</div>');
            console.log('📝 Performans listesi boş - bilgi mesajı eklendi');
            return;
        }
        
        console.log('📋 ' + performances.length + ' performans HTML olarak ekleniyor...');
        
        // Add each performance to the list
        $.each(performances, function(index, performance) {
            console.log('➕ Performans ekleniyor:', performance.name);
            
            var performanceItem = $('<div class="bkm-item"></div>').attr('data-id', performance.id);
            var performanceContent = $('<div class="bkm-item-content"></div>');
            var performanceTitle = $('<strong></strong>').text(performance.name);
            
            performanceContent.append(performanceTitle);
            
            if (performance.description && performance.description.trim()) {
                var performanceDesc = $('<p></p>').text(performance.description);
                performanceContent.append(performanceDesc);
            }
            
            var performanceActions = $('<div class="bkm-item-actions"></div>');
            var editButton = $('<button class="bkm-btn bkm-btn-small bkm-btn-info">✏️ Düzenle</button>');
            
            // Safe attribute binding for edit button
            editButton.on('click', function() {
                if (typeof window.editPerformance === 'function') {
                    window.editPerformance(performance.id, performance.name, performance.description || '');
                }
            });
            
            performanceActions.append(editButton);
            performanceItem.append(performanceContent).append(performanceActions);
            performancesList.append(performanceItem);
        });
        
        console.log('✅ Performans listesi güncellendi, ' + performances.length + ' performans gösteriliyor');
    }
    
    // ===== AYARLAR PANELİ FONKSİYONLARI =====
    
    // Ayarlar paneli toggle
    function toggleSettingsPanel() {
        try {
            console.log('🔧 toggleSettingsPanel fonksiyonu çağrıldı');
            
            var panel = $('#bkm-settings-panel');
            console.log('📋 Panel elementi bulundu:', panel.length > 0);
            
            if (panel.length === 0) {
                console.error('❌ HATA: bkm-settings-panel elementi bulunamadı!');
                alert('HATA: Ayarlar paneli elementi bulunamadı!');
                return;
            }
            
            var isVisible = panel.is(':visible');
            console.log('👁️ Panel görünür durumda:', isVisible);
            
            if (isVisible) {
                console.log('🔼 Panel kapatılıyor...');
                panel.slideUp();
            } else {
                console.log('🔽 Panel açılıyor...');
                // Diğer panelleri kapat
                $('#bkm-action-form, #bkm-task-form').slideUp();
                panel.slideDown();
                // İlk tab'ı aktif et
                if (!panel.find('.settings-tab.active').length) {
                    console.log('🏷️ İlk tab aktif ediliyor...');
                    switchSettingsTab('categories');
                }
                // Verileri yükle
                console.log('👥 Kullanıcılar - PHP listesi kullanılıyor (AJAX devre dışı)');
                // loadUsers(); // Geçici olarak kapatıldı - PHP listesi korunuyor
            }
        } catch (error) {
            console.error('❌ toggleSettingsPanel hatası:', error);
            alert('HATA: ' + error.message);
        }
    }
    
    // Tab değiştirme fonksiyonu
    function switchSettingsTab(tabName) {
        console.log('🔄 Tab değiştiriliyor:', tabName);
        
        // Tüm tab butonlarından active class'ını kaldır
        $('.settings-tab').removeClass('active');
        
        // Tüm tab content'lerini gizle
        $('.bkm-settings-tab-content').removeClass('active');
        
        // Seçilen tab'ı aktif et
        $('.settings-tab[data-tab="' + tabName + '"]').addClass('active');
        $('#settings-tab-' + tabName).addClass('active');
        
               
        // Tab'a özel yükleme işlemleri
        if (tabName === 'users') {
            // loadUsers(); // Geçici olarak kapatıldı - PHP listesi korunuyor
            console.log('👥 Users tab - PHP listesi kullanılıyor');
        } else if (tabName === 'company' && typeof loadCompanyInfo === 'function') {
            loadCompanyInfo();
        }
    }
    // ===== AYARLAR PANELİ EVENT LISTENERS =====
    
    // Ayarlar paneli event listener'larını kur
    function setupSettingsEventListeners() {
        console.log('🔧 Ayarlar paneli event listener\'ları kuruluyor...');
        
        // Tab butonları click event
        $(document).off('click', '.settings-tab');
        $(document).on('click', '.settings-tab', function() {
            var tabName = $(this).data('tab');
            console.log('📂 Tab değiştiriliyor:', tabName);
            switchSettingsTab(tabName);
        });
        
        // Kullanıcı formu submit event
        $(document).off('submit', '#bkm-user-form-element');
        $(document).on('submit', '#bkm-user-form-element', handleUserFormSubmit);
        
        console.log('✅ Ayarlar paneli event listener\'ları kuruldu');
    }
    
    // Global fonksiyonları window objesine ekle
    window.toggleCategoriesPanel = toggleCategoriesPanel;
    window.togglePerformancesPanel = togglePerformancesPanel;
    window.toggleSettingsPanel = toggleSettingsPanel;
    window.switchSettingsTab = switchSettingsTab;
    window.clearCategoryForm = clearCategoryForm;
    window.clearPerformanceForm = clearPerformanceForm;
    window.clearUserForm = clearUserForm;
    window.clearCompanyForm = clearCompanyForm;
    window.clearAllSettingsForms = clearAllSettingsForms;
    window.editCategory = editCategory;
    window.editPerformance = editPerformance;
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.loadUsers = loadUsers;
    window.refreshCategoryDropdown = refreshCategoryDropdown;
    window.refreshCategoryList = refreshCategoryList;
    window.refreshPerformanceDropdown = refreshPerformanceDropdown;
    window.refreshPerformanceList = refreshPerformanceList;
    window.displayUsers = displayUsers;
    window.handleUserFormSubmit = handleUserFormSubmit;
    window.clearUserForm = clearUserForm;
    window.setupSettingsEventListeners = setupSettingsEventListeners;
    
    // Document ready event handler
    $(document).ready(function() {
        console.log('📋 BKM Frontend JS yüklendi');
        console.log('✅ jQuery versiyonu:', $.fn.jquery);
        console.log('🎯 BKM Container:', $('.bkm-frontend-container').length > 0 ? 'Bulundu' : 'Bulunamadı');
        
        // CSS fix - WordPress tema çakışmalarını çöz
        $('head').append(`
            <style>
                .bkm-frontend-container { 
                    background: #f8f9fa !important; 
                    padding: 20px !important; 
                    margin: 0 auto !important; 
                    max-width: 1200px !important; 
                }
                .bkm-table { 
                    width: 100% !important; 
                    background: #fff !important; 
                    border-collapse: collapse !important; 
                    border-radius: 8px !important; 
                    overflow: hidden !important; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important; 
                }
                .bkm-table th, .bkm-table td { 
                    padding: 12px 15px !important; 
                    border-bottom: 1px solid #e9ecef !important; 
                }
                .bkm-table th { 
                    background: #f8f9fa !important; 
                    font-weight: 600 !important; 
                }
                .bkm-btn { 
                    padding: 12px 24px !important; 
                    border-radius: 8px !important; 
                    border: none !important; 
                    cursor: pointer !important; 
                    font-size: 14px !important; 
                }
                .bkm-btn-primary { 
                    background: #007cba !important; 
                    color: #fff !important; 
                }
                .bkm-btn-warning { 
                    background: #ffc107 !important; 
                    color: #212529 !important; 
                }
                .bkm-dashboard-header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; 
                    color: #fff !important; 
                    padding: 30px !important; 
                    border-radius: 8px !important; 
                    margin-bottom: 20px !important; 
                }
            </style>
        `);
        
        console.log('🎨 CSS düzeltmeleri uygulandı');
        
        // Ayarlar paneli için event listener'ları ekle
        if (typeof setupSettingsEventListeners === 'function') {
            setupSettingsEventListeners();
            console.log('⚙️ Ayarlar paneli event listener\'ları kuruldu');
        }
        
        // Toggle fonksiyonunu test et
        if (typeof toggleSettingsPanel === 'function') {
            console.log('✅ toggleSettingsPanel fonksiyonu hazır');
        } else {
            console.error('❌ toggleSettingsPanel fonksiyonu bulunamadı');
        }
    });
    
// jQuery wrapper'ı kapat
})(jQuery);

// ===== GLOBAL FONKSİYONLARI WINDOW OBJESİNE EKLE =====
// Console hatalarını önlemek için tüm fonksiyonları global yapıyoruz

// Form toggle fonksiyonları
window.toggleTaskForm = window.toggleTaskForm || function() {
    console.log('🔧 toggleTaskForm çağrıldı (fallback)');
    jQuery('#bkm-task-form').slideToggle();
};

window.toggleActionForm = window.toggleActionForm || function() {
    console.log('🔧 toggleActionForm çağrıldı (fallback)');
    jQuery('#bkm-action-form').slideToggle();
};

// Ayarlar paneli fonksiyonları
window.toggleSettingsPanel = window.toggleSettingsPanel || function() {
    console.log('🔧 toggleSettingsPanel çağrıldı (fallback)');
    jQuery('#bkm-settings-panel').slideToggle();
};

window.switchSettingsTab = window.switchSettingsTab || function(tabName) {
    console.log('🔧 switchSettingsTab çağrıldı (fallback):', tabName);
};

// Aksiyon ve görev detay fonksiyonları
window.toggleTasks = window.toggleTasks || function(actionId) {
    console.log('🔧 toggleTasks çağrıldı (fallback):', actionId);
    jQuery('#tasks-' + actionId).slideToggle();
};

window.toggleActionDetails = window.toggleActionDetails || function(actionId) {
    console.log('🔧 toggleActionDetails çağrıldı (fallback):', actionId);
    jQuery('#details-' + actionId).slideToggle();
};

// Not fonksiyonları
window.toggleNoteForm = window.toggleNoteForm || function(taskId) {
    console.log('🔧 toggleNoteForm çağrıldı (fallback):', taskId);
    jQuery('#note-form-' + taskId).slideToggle();
};

window.toggleNotes = window.toggleNotes || function(taskId) {
    console.log('🔧 toggleNotes çağrıldı (fallback):', taskId);
    jQuery('#notes-' + taskId).slideToggle();
};

window.toggleReplyForm = window.toggleReplyForm || function(taskId, noteId) {
    console.log('🔧 toggleReplyForm çağrıldı (fallback):', taskId, noteId);
    jQuery('#reply-form-' + taskId + '-' + noteId).slideToggle();
};

// Yazdırma fonksiyonu
window.bkmPrintTable = window.bkmPrintTable || function() {
    console.log('🔧 bkmPrintTable çağrıldı (fallback)');
    window.print();
};

// Form temizleme fonksiyonları
window.clearActionForm = window.clearActionForm || function() {
    console.log('🔧 clearActionForm çağrıldı (fallback)');
    jQuery('#bkm-action-form-element')[0].reset();
};

// Ayarlar paneli yönetim fonksiyonları
window.clearCategoryForm = function() {
    console.log('🔧 clearCategoryForm çağrıldı');
    jQuery('#bkm-category-form-element')[0].reset();
};

window.clearPerformanceForm = function() {
    console.log('🔧 clearPerformanceForm çağrıldı');
    jQuery('#bkm-performance-form-element')[0].reset();
};

window.clearUserForm = function() {
    console.log('🔧 clearUserForm çağrıldı');
    jQuery('#bkm-user-form-element')[0].reset();
};

// Düzenleme fonksiyonları - ÇALIŞAN VERSİYON
window.editCategory = function(id, name, description) {
    console.log('🔧 editCategory çağrıldı:', id, name, description);
    var form = jQuery('#bkm-category-form-element');
    form.find('#category_name').val(name);
    form.find('#category_description').val(description);
    form.find('button[type="submit"]').text('✅ Kategori Güncelle');
    form.data('edit-id', id);
    
    // Form alanını highlight et
    form.find('#category_name').focus();
};

window.editPerformance = function(id, name, description) {
    console.log('🔧 editPerformance çağrıldı:', id, name, description);
    var form = jQuery('#bkm-performance-form-element');
    form.find('#performance_name').val(name);
    form.find('#performance_description').val(description);
    form.find('button[type="submit"]').text('✅ Performans Güncelle');
    form.data('edit-id', id);
    
    // Form alanını highlight et
    form.find('#performance_name').focus();
};

window.editUser = function(id, username, email, first_name, last_name, role) {
    console.log('🔧 editUser çağrıldı:', id, username, email, first_name, last_name, role);
    
    // Kullanıcı tabına geç
    switchSettingsTab('users');
    
    // Form'u bul ve doldur
    var form = jQuery('#bkm-user-form-element');
    if (form.length === 0) {
        console.error('❌ Kullanıcı formu bulunamadı!');
        return;
    }
    
    // Formu temizle
    clearUserForm();
    
    // Form alanlarını doldur
    form.find('#user_username').val(username).prop('disabled', true);
    form.find('#user_email').val(email);
    form.find('#user_first_name').val(first_name || '');
    form.find('#user_last_name').val(last_name || '');
    form.find('#user_role').val(role || '');
    form.find('#user_password').prop('required', false);
    
    // Form başlığını değiştir
    form.prev('h4').text('Kullanıcı Düzenle');
    form.find('button[type="submit"]').text('✅ Kullanıcı Güncelle');
    
    // Edit ID'yi form'a data olarak ekle
    form.data('edit-id', id);
    
    console.log('✅ Kullanıcı düzenleme formu hazırlandı');
};

window.deleteUser = function(id, name) {
    console.log('🔧 deleteUser çağrıldı:', id, name);
    
    if (!name) {
        name = 'Bu kullanıcı';
    }
    
    if (confirm('⚠️ "' + name + '" kullanıcısını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!')) {
        // AJAX silme işlemi
        jQuery.ajax({
            url: bkmFrontend.ajax_url,
            type: 'POST',
            data: {
                action: 'bkm_delete_user',
                user_id: id,
                nonce: bkmFrontend.nonce
            },
            beforeSend: function() {
                console.log('🗑️ Kullanıcı siliniyor...');
                if (typeof showNotification === 'function') {
                    showNotification('Kullanıcı siliniyor...', 'info');
                }
            },
            success: function(response) {
                console.log('✅ Kullanıcı silme yanıtı:', response);
                
                if (response.success) {
                    if (typeof showNotification === 'function') {
                        showNotification('Kullanıcı başarıyla silindi!', 'success');
                    } else {
                        alert('✅ Kullanıcı başarıyla silindi!');
                    }
                    // Kullanıcı silme sonrası AJAX ile listeyi güncelle
                    // loadUsers(); // Geçici olarak kapatıldı - PHP listesi korunuyor
                } else {
                    var errorMsg = response.data && response.data.message ? response.data.message : 'Kullanıcı silinemedi';
                    if (typeof showNotification === 'function') {
                        showNotification('Hata: ' + errorMsg, 'error');
                    } else {
                        alert('❌ Hata: ' + errorMsg);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('❌ AJAX hatası:', error);
                if (typeof showNotification === 'function') {
                    showNotification('Bağlantı hatası: ' + error, 'error');
                } else {
                    alert('❌ Bağlantı hatası: ' + error);
                }
            }
        });
    }
};

// ===== COMPANY SETTINGS MANAGEMENT =====

// Company form AJAX handler duplicate kaldırıldı - jQuery wrapper içindeki handler kullanılıyor

// Logo file input change handler
jQuery(document).on('change', '#company_logo', function() {
    var file = this.files[0];
    if (file) {
        // Validate file type
        var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.indexOf(file.type) === -1) {
            alert('Sadece JPG, PNG ve GIF formatları desteklenmektedir.');
            this.value = '';
            return;
        }
        
        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Dosya boyutu 2MB\'dan küçük olmalıdır.');
            this.value = '';
            return;
        }
        
        // Preview image
        var reader = new FileReader();
        reader.onload = function(e) {
            var preview = jQuery('#logo-preview');
            preview.html(
                '<img src="' + e.target.result + '" alt="Logo Önizleme" />' +
                '<button type="button" class="bkm-btn bkm-btn-danger bkm-btn-small bkm-remove-logo" onclick="clearNewLogoPreview()">' +
                '🗑️ Kaldır</button>'
            );
        };
        reader.readAsDataURL(file);
    }
});

// Update company info display
function updateCompanyInfoDisplay(companyInfo) {
    var display = jQuery('#company-info-display');
    var html = '';
    
    if (companyInfo.name || companyInfo.logo) {
        html += '<div class="bkm-company-header">';
        
        if (companyInfo.logo) {
            html += '<div class="bkm-company-logo-display">';
            html += '<img src="' + companyInfo.logo + '" alt="' + (companyInfo.name || 'Logo') + '" />';
            html += '</div>';
        }
        
        if (companyInfo.name) {
            html += '<h5>' + companyInfo.name + '</h5>';
        }
        
        html += '</div>';
        html += '<div class="bkm-company-details">';
        
        if (companyInfo.address) {
            html += '<p><strong>📍 Adres:</strong> ' + companyInfo.address + '</p>';
        }
        if (companyInfo.phone) {
            html += '<p><strong>📞 Telefon:</strong> ' + companyInfo.phone + '</p>';
        }
        if (companyInfo.email) {
            html += '<p><strong>📧 E-posta:</strong> ' + companyInfo.email + '</p>';
        }
        
        html += '</div>';
    } else {
        html = '<div class="bkm-no-company-info">';
        html += '<p><em>Henüz firma bilgileri eklenmemiş.</em></p>';
        html += '<p>Lütfen firma bilgilerini doldurun.</p>';
        html += '</div>';
    }
    
    display.html(html);
}

// Clear logo preview
function clearLogoPreview() {
    jQuery('#company_logo').val('');
    jQuery('#logo-preview').html(
        '<div class="bkm-logo-placeholder">' +
        '<i class="dashicons dashicons-camera"></i>' +
        '<p>Logo yüklemek için dosya seçin</p>' +
        '</div>'
    );
}

// Clear new logo preview and restore saved logo if exists
function clearNewLogoPreview() {
    jQuery('#company_logo').val('');
    
    // Check if there's a saved logo to restore
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_get_company_info'
        },
        success: function(response) {
            if (response.success && response.data.company_info.logo) {
                // Restore saved logo
                jQuery('#logo-preview').html(
                    '<img src="' + response.data.company_info.logo + '" alt="Mevcut Logo" />' +
                    '<button type="button" class="bkm-btn bkm-btn-danger bkm-btn-small bkm-remove-logo" onclick="removeCompanyLogo()">' +
                    '🗑️ Logoyu Kaldır</button>'
                );
            } else {
                // No saved logo, show placeholder
                clearLogoPreview();
            }
        },
        error: function() {
            // Error getting info, show placeholder
            clearLogoPreview();
        }
    });
}

// Remove company logo
function removeCompanyLogo() {
    if (!confirm('Firma logosunu kaldırmak istediğinizden emin misiniz?')) {
        return;
    }
    
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_remove_company_logo',
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            if (response.success) {
                if (typeof showNotification === 'function') {
                    showNotification(response.data.message, 'success');
                } else {
                    alert(response.data.message);
                }
                
                // Update logo preview
                clearLogoPreview();
                
                // Update company info display
                var form = jQuery('#bkm-company-form-element');
                var companyInfo = {
                    name: form.find('#company_name').val(),
                    address: form.find('#company_address').val(),
                    phone: form.find('#company_phone').val(),
                    email: form.find('#company_email').val(),
                    logo: ''
                };
                updateCompanyInfoDisplay(companyInfo);
            } else {
                alert('Hata: ' + response.data.message);
            }
        },
        error: function() {
            alert('Logo kaldırılırken bir hata oluştu.');
        }
    });
}

// Reset company form
function resetCompanyForm() {
    if (!confirm('Tüm alanları sıfırlamak istediğinizden emin misiniz?')) {
        return;
    }
    
    var form = jQuery('#bkm-company-form-element');
    form[0].reset();
    clearLogoPreview();
}

// Load company info on tab switch
function loadCompanyInfo() {
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_get_company_info'
        },
        success: function(response) {
            if (response.success) {
                var info = response.data.company_info;
                updateCompanyInfoDisplay(info);
                
                // Update form fields
                var form = jQuery('#bkm-company-form-element');
                form.find('#company_name').val(info.name);
                form.find('#company_address').val(info.address);
                form.find('#company_phone').val(info.phone);
                form.find('#company_email').val(info.email);
                
                // Update logo preview
                if (info.logo) {
                    jQuery('#logo-preview').html(
                        '<img src="' + info.logo + '" alt="Mevcut Logo" />' +
                        '<button type="button" class="bkm-btn bkm-btn-danger bkm-btn-small bkm-remove-logo" onclick="removeCompanyLogo()">' +
                        '🗑️ Logoyu Kaldır</button>'
                    );
                }
            }
        },
        error: function() {
            console.log('Firma bilgileri yüklenirken hata oluştu.');
        }
    });
}

// Make functions globally available
window.clearLogoPreview = clearLogoPreview;
window.clearNewLogoPreview = clearNewLogoPreview;
window.removeCompanyLogo = removeCompanyLogo;
window.resetCompanyForm = resetCompanyForm;
window.loadCompanyInfo = loadCompanyInfo;
window.updateCompanyInfoDisplay = updateCompanyInfoDisplay;

// Ensure all critical functions are globally available
window.toggleNotes = window.toggleNotes;
window.toggleNoteForm = window.toggleNoteForm;
window.toggleActionDetails = window.toggleActionDetails;
window.toggleTasks = window.toggleTasks;
window.toggleActionForm = window.toggleActionForm;
window.toggleTaskForm = window.toggleTaskForm;
window.toggleSettingsPanel = window.toggleSettingsPanel;
window.loadTaskNotes = window.loadTaskNotes;
window.toggleReplyForm = window.toggleReplyForm;

console.log('✅ Tüm global fonksiyonlar window objesine eklendi');
console.log('🔧 Mevcut global fonksiyonlar:', {
    toggleNotes: typeof window.toggleNotes,
    toggleNoteForm: typeof window.toggleNoteForm,
    toggleActionDetails: typeof window.toggleActionDetails,
    toggleTasks: typeof window.toggleTasks,
    toggleActionForm: typeof window.toggleActionForm,
    toggleTaskForm: typeof window.toggleTaskForm,
    showNotification: typeof window.showNotification
});

// Filtreleri temizle fonksiyonu
function clearAllFilters() {
    jQuery('#filter-tanimlayan').val('');
    jQuery('#filter-sorumlu').val('');
    jQuery('#filter-kategori').val('');
    jQuery('#filter-onem').val('');
    jQuery('#filter-durum').val('');
    jQuery('.bkm-filter-select').trigger('change');
}
window.clearAllFilters = clearAllFilters;

// ===== TASK ACCEPT/REJECT FUNCTIONALITY =====

/**
 * Accept a task
 */
function acceptTask(taskId) {
    if (!confirm('Bu görevi kabul etmek istediğinizden emin misiniz?')) {
        return;
    }
    
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_accept_task',
            task_id: taskId,
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            if (response.success) {
                showNotification('Görev başarıyla kabul edildi!', 'success');
                // Reload the page to show updated status
                location.reload();
            } else {
                showNotification('Hata: ' + response.data, 'error');
            }
        },
        error: function() {
            showNotification('Bağlantı hatası oluştu.', 'error');
        }
    });
}
window.acceptTask = acceptTask;

/**
 * Show reject form for task
 */
function showRejectForm(taskId) {
    var rejectForm = jQuery('#reject-form-' + taskId);
    rejectForm.slideDown();
    jQuery('#rejection_reason_' + taskId).focus();
}
window.showRejectForm = showRejectForm;

/**
 * Hide reject form for task
 */
function hideRejectForm(taskId) {
    var rejectForm = jQuery('#reject-form-' + taskId);
    rejectForm.slideUp();
    jQuery('#rejection_reason_' + taskId).val('');
}
window.hideRejectForm = hideRejectForm;

/**
 * Reject a task
 */
function rejectTask(taskId) {
    var rejectionReason = jQuery('#rejection_reason_' + taskId).val().trim();
    
    if (!rejectionReason) {
        showNotification('Lütfen reddetme sebebini belirtiniz.', 'error');
        jQuery('#rejection_reason_' + taskId).focus();
        return;
    }
    
    if (!confirm('Bu görevi reddetmek istediğinizden emin misiniz?')) {
        return;
    }
    
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_reject_task',
            task_id: taskId,
            rejection_reason: rejectionReason,
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            if (response.success) {
                showNotification('Görev başarıyla reddedildi!', 'success');
                // Reload the page to show updated status
                location.reload();
            } else {
                showNotification('Hata: ' + response.data, 'error');
            }
        },
        error: function() {
            showNotification('Bağlantı hatası oluştu.', 'error');
        }
    });
}
window.rejectTask = rejectTask;

// ===== TASK EDITING FUNCTIONALITY =====

/**
 * Toggle task edit form
 */
function toggleTaskEditForm(taskId) {
    var editForm = jQuery('#task-edit-form-' + taskId);
    if (editForm.is(':visible')) {
        editForm.slideUp();
    } else {
        editForm.slideDown();
        jQuery('#edit_content_' + taskId).focus();
    }
}
window.toggleTaskEditForm = toggleTaskEditForm;

/**
 * Save task edit
 */
function saveTaskEdit(taskId) {
    var content = jQuery('#edit_content_' + taskId).val().trim();
    var targetDate = jQuery('#edit_target_date_' + taskId).val();
    var editReason = jQuery('#edit_reason_' + taskId).val().trim();
    
    if (!content) {
        showNotification('Görev içeriği boş olamaz.', 'error');
        jQuery('#edit_content_' + taskId).focus();
        return;
    }
    
    if (!targetDate) {
        showNotification('Hedef tarih belirtilmelidir.', 'error');
        jQuery('#edit_target_date_' + taskId).focus();
        return;
    }
    
    if (!editReason) {
        showNotification('Düzenleme sebebi belirtilmelidir.', 'error');
        jQuery('#edit_reason_' + taskId).focus();
        return;
    }
    
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_edit_task',
            task_id: taskId,
            content: content,
            target_date: targetDate,
            edit_reason: editReason,
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            if (response.success) {
                showNotification('Görev başarıyla güncellendi!', 'success');
                // Reload the page to show updated task
                location.reload();
            } else {
                showNotification('Hata: ' + response.data, 'error');
            }
        },
        error: function() {
            showNotification('Bağlantı hatası oluştu.', 'error');
        }
    });
}
window.saveTaskEdit = saveTaskEdit;

/**
 * Toggle task history display
 */
function toggleTaskHistory(taskId) {
    var historySection = jQuery('#task-history-' + taskId);
    
    if (historySection.is(':visible')) {
        historySection.slideUp();
    } else {
        historySection.slideDown();
        loadTaskHistory(taskId);
    }
}
window.toggleTaskHistory = toggleTaskHistory;

/**
 * Load task change history
 */
function loadTaskHistory(taskId) {
    var historyContent = jQuery('#task-history-content-' + taskId);
    historyContent.html('<p style="text-align: center; color: #666;">Geçmiş yükleniyor...</p>');
    
    jQuery.ajax({
        url: bkmFrontend.ajax_url,
        type: 'POST',
        data: {
            action: 'bkm_get_task_history',
            task_id: taskId,
            nonce: bkmFrontend.nonce
        },
        success: function(response) {
            if (response.success) {
                var history = response.data;
                if (history.length === 0) {
                    historyContent.html('<p style="text-align: center; color: #666; font-style: italic;">Bu görev için henüz değişiklik geçmişi bulunmamaktadır.</p>');
                } else {
                    var html = '<div class="bkm-history-list">';
                    
                    jQuery.each(history, function(index, change) {
                        var date = new Date(change.created_at);
                        var formattedDate = date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
                        
                        html += '<div class="bkm-history-item" style="background: #f8f9fa; padding: 12px; margin-bottom: 8px; border-radius: 4px; border-left: 4px solid #007cba;">';
                        html += '<div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">';
                        html += '<strong style="color: #007cba;">' + escapeHtml(change.user_name) + '</strong>';
                        html += '<span style="color: #666; font-size: 0.9em; margin-left: auto;">' + formattedDate + '</span>';
                        html += '</div>';
                        html += '<div style="margin-bottom: 6px;"><strong>Değiştirilen Alanlar:</strong> ' + escapeHtml(change.changed_fields) + '</div>';
                        html += '<div style="background: #fff; padding: 8px; border-radius: 4px; font-style: italic; color: #666;">';
                        html += '<strong>Sebep:</strong> ' + escapeHtml(change.change_reason);
                        html += '</div>';
                        
                        // Show old and new values if available
                        if (change.old_values && change.new_values) {
                            try {
                                var oldValues = JSON.parse(change.old_values);
                                var newValues = JSON.parse(change.new_values);
                                
                                html += '<div style="margin-top: 8px; font-size: 0.9em;">';
                                jQuery.each(oldValues, function(field, oldValue) {
                                    var newValue = newValues[field] || '';
                                    html += '<div style="margin: 4px 0;">';
                                    html += '<span style="color: #dc3545;">Eski:</span> ' + escapeHtml(oldValue) + ' ';
                                    html += '→ <span style="color: #28a745;">Yeni:</span> ' + escapeHtml(newValue);
                                    html += '</div>';
                                });
                                html += '</div>';
                            } catch (e) {
                                // JSON parsing failed, ignore
                            }
                        }
                        
                        html += '</div>';
                    });
                    
                    html += '</div>';
                    historyContent.html(html);
                }
            } else {
                historyContent.html('<p style="text-align: center; color: #dc3545;">Geçmiş yüklenirken hata oluştu: ' + response.data + '</p>');
            }
        },
        error: function() {
            historyContent.html('<p style="text-align: center; color: #dc3545;">Bağlantı hatası oluştu.</p>');
        }
    });
}

/**
 * Add new action to the actions table without page refresh
 */
function addNewActionToTable(responseData) {
    console.log('➕ Adding new action to table:', responseData);
    
    var actionData = responseData.action_data;
    if (!actionData) {
        console.error('❌ No action data provided');
        return;
    }
    
    var actionsTable = jQuery('.bkm-actions-table table tbody');
    if (actionsTable.length === 0) {
        console.error('❌ Actions table not found');
        return;
    }
    
    // Create priority label
    var priorityLabels = {
        '1': 'Düşük',
        '2': 'Orta', 
        '3': 'Yüksek',
        '4': 'Kritik'
    };
    var priorityLabel = priorityLabels[actionData.onem_derecesi] || 'Bilinmiyor';
    
    // Format date
    var formattedDate = new Date(actionData.hedef_tarih).toLocaleDateString('tr-TR');
    
    // Create new row HTML
    var newRowHtml = '<tr data-action-id="' + actionData.action_id + '" class="new-action-highlight">' +
        '<td>' + actionData.action_id + '</td>' +
        '<td>' + escapeHtml(actionData.tanımlayan_name) + '</td>' +
        '<td>' + escapeHtml(actionData.kategori_name) + '</td>' +
        '<td class="bkm-content-cell" title="' + escapeHtml(actionData.tespit_konusu) + '">' +
            escapeHtml(actionData.tespit_konusu.substring(0, 50)) + (actionData.tespit_konusu.length > 50 ? '...' : '') +
        '</td>' +
        '<td class="bkm-content-cell" title="' + escapeHtml(actionData.aciklama) + '">' +
            escapeHtml(actionData.aciklama.substring(0, 50)) + (actionData.aciklama.length > 50 ? '...' : '') +
        '</td>' +
        '<td><span class="bkm-priority priority-' + actionData.onem_derecesi + '">' + priorityLabel + '</span></td>' +
        '<td>' + formattedDate + '</td>' +
        '<td>' +
            '<div class="bkm-action-status">' +
                '<span class="bkm-badge bkm-badge-open">Açık</span>' +
                '<div class="bkm-progress">' +
                    '<div class="bkm-progress-bar" style="width: 0%"></div>' +
                    '<span class="bkm-progress-text">0%</span>' +
                '</div>' +
            '</div>' +
            '<div class="bkm-action-controls">' +
                '<button class="bkm-btn bkm-btn-small" onclick="toggleActionDetails(' + actionData.action_id + ')">' +
                    '📋 Detaylar' +
                '</button>' +
                '<button class="bkm-btn bkm-btn-small" onclick="toggleTasks(' + actionData.action_id + ')">' +
                    '📝 Görevler (0)' +
                '</button>' +
            '</div>' +
        '</td>' +
    '</tr>';
    
    // Add details row
    newRowHtml += '<tr id="details-' + actionData.action_id + '" class="bkm-details-row" style="display: none;">' +
        '<td colspan="8">' +
            '<div class="bkm-action-details">' +
                '<div class="bkm-detail-grid">' +
                    '<div class="bkm-detail-item">' +
                        '<strong>Kategori:</strong> ' +
                        '<span class="bkm-badge bkm-badge-category">' + escapeHtml(actionData.kategori_name) + '</span>' +
                    '</div>' +
                    '<div class="bkm-detail-item">' +
                        '<strong>Önem Derecesi:</strong> ' +
                        '<span class="bkm-priority priority-' + actionData.onem_derecesi + '">' + priorityLabel + '</span>' +
                    '</div>' +
                    '<div class="bkm-detail-item">' +
                        '<strong>Hedef Tarih:</strong> ' + formattedDate +
                    '</div>' +
                    '<div class="bkm-detail-item">' +
                        '<strong>Durum:</strong> ' +
                        '<span class="bkm-badge bkm-badge-open">Açık</span>' +
                    '</div>' +
                    '<div class="bkm-detail-item">' +
                        '<strong>İlerleme:</strong>' +
                        '<div class="bkm-progress">' +
                            '<div class="bkm-progress-bar" style="width: 0%"></div>' +
                            '<span class="bkm-progress-text">0%</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</td>' +
    '</tr>';
    
    // Add tasks row
    newRowHtml += '<tr id="tasks-' + actionData.action_id + '" class="bkm-tasks-row" style="display: none;">' +
        '<td colspan="8">' +
            '<div class="bkm-tasks-section">' +
                '<h4>Görevler</h4>' +
                '<div class="bkm-tasks-list">' +
                    '<p>Bu aksiyon için henüz görev bulunmamaktadır.</p>' +
                '</div>' +
            '</div>' +
        '</td>' +
    '</tr>';
    
    // Add the new row at the beginning of the table
    actionsTable.prepend(newRowHtml);
    
    // Add highlight animation
    var newRow = actionsTable.find('tr[data-action-id="' + actionData.action_id + '"]');
    newRow.addClass('new-action-highlight');
    
    // Remove highlight after animation
    setTimeout(function() {
        newRow.removeClass('new-action-highlight');
    }, 3000);
    
    // Scroll to the new action
    jQuery('html, body').animate({
        scrollTop: newRow.offset().top - 100
    }, 600, 'swing');
    
    console.log('✅ New action added to table successfully');
}