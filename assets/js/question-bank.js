    // --- SETUP DEFAULTS ---
    function loadDefaultPackages() {
      // 46 Paket Soal sesuai PDF yang diberikan. Menggunakan properti tipe "reguler" dan "special"
      packagesList = {
        1: { id: 1, type: "reguler", subject: "REGULER 1", question: "Buatlah esai mengenai implementasi Hak asasi manusia yang dapat diimplementasikan oleh generasi muda di masa kini dan mendatang.", duration: 600 },
        2: { id: 2, type: "reguler", subject: "REGULER 2", question: "Buatlah esai tentang toleransi kehidupan beragama di Indonesia yang dapat dipraktekan oleh generasi muda di lingkungan anda.", duration: 600 },
        3: { id: 3, type: "reguler", subject: "REGULER 3", question: "Buatlah esai mengenai penerapan demokrasi yang dapat diimplementasikan oleh generasi muda di lingkungan sekitar.", duration: 600 },
        4: { id: 4, type: "reguler", subject: "REGULER 4", question: "Buatlah esai mengenai tindakan bela negara yang dapat diimplementasikan oleh generasi muda di era digital.", duration: 600 },
        5: { id: 5, type: "reguler", subject: "REGULER 5", question: "Buatlah esai mengenai penerapan penggunaan bahasa Indonesia yang dapat diimplementasikan oleh generasi muda di kehidupan sehari-hari.", duration: 600 },
        6: { id: 6, type: "reguler", subject: "REGULER 6", question: "Buatlah esai mengenal praktek keadilan sosial yang dapat diimplementasikan oleh generasi muda dalam kehidupan sehari-hari.", duration: 600 },
        7: { id: 7, type: "reguler", subject: "REGULER 7", question: "Jelaskan konsep Bela Negara yang paling relevan bagi Anda sebagai calon Intelektual muda di abad ke-21, di luar konteks pertahanan militer.", duration: 600 },
        8: { id: 8, type: "reguler", subject: "REGULER 8", question: "Di tengah maraknya politik Identitas, Jelaskan satu langkah konkret yang akan Anda ambil untuk mempraktikkan dan menjaga nilai Persatuan Indonesia.", duration: 600 },
        9: { id: 9, type: "reguler", subject: "REGULER 9", question: "Selain menjalankan ibadah sesuai keyakinan Anda, bagaimana wujud nyata pengamalan Sila Pertama dalam merespons keberagaman agama di lingkungan pergaulan Anda?", duration: 600 },
        10: { id: 10, type: "reguler", subject: "REGULER 10", question: "Menurut Anda, apa elemen terpenting dari identitas nasional Indonesia yang harus dipertahankan dan diperkuat di tengah persaingan global?", duration: 600 },
        11: { id: 11, type: "reguler", subject: "REGULER 11", question: "Sebagai digital native, jelaskan tanggung jawab etis terbesar yang Anda miliki dalam menggunakan media sosial untuk kemajuan bangsa.", duration: 600 },
        12: { id: 12, type: "reguler", subject: "REGULER 12", question: "Bagaimana nilai-nilai luhur bangsa, seperti gotong royong, dapat diimplementasikan secara modern dalam upaya mengatasi krisis lingkungan di Indonesia?", duration: 600 },
        13: { id: 13, type: "reguler", subject: "REGULER 13", question: "Bagaimana cara kita meneruskan jasa pahlawan?", duration: 600 },
        14: { id: 14, type: "reguler", subject: "REGULER 14", question: "Bayangkan 10 tahun dari sekarang setelah Anda lulus. Kontribusi spesifik apa, sesuai dengan bidang ilmu yang akan Anda tekuni, yang ingin Anda berikan untuk Indonesia?", duration: 600 },
        15: { id: 15, type: "reguler", subject: "REGULER 15", question: "Bagaimana peran generasi muda dalam melestarikan lingkungan hidup di Indonesia?", duration: 600 },
        16: { id: 16, type: "reguler", subject: "REGULER 16", question: "Semboyan Bhinneka Tunggal Ika adalah fondasi bangsa. Berikan satu contoh nyata bagaimana Anda dapat merawat semboyan ini di tengah arus globalisasi dan budaya asing.", duration: 600 },
        17: { id: 17, type: "reguler", subject: "REGULER 17", question: "Jelaskan mengenai konsep Bela Negara dan apa yang bisa Anda lakukan sebagai warga negara Indonesia untuk membela NKRI?", duration: 600 },
        18: { id: 18, type: "reguler", subject: "REGULER 18", question: "Identifikasikan satu akar masalah yang menurut Anda paling berpotensi menyebabkan disintegrasi bangsa saat ini, dan jelaskan gagasan Anda untuk mencabut akar tersebut.", duration: 600 },
        19: { id: 19, type: "reguler", subject: "REGULER 19", question: "Pancasila sering disebut relevan di setiap zaman. Menurut Anda, bagaimana nilai-nilai Pancasila dapat menjadi solusi atas tantangan terbesar yang dihadapi generasi Anda saat ini?", duration: 600 },
        20: { id: 20, type: "reguler", subject: "REGULER 20", question: "Bagaimana kontribusi generasi muda dalam memelihara keberagaman budaya di Indonesia?", duration: 600 },
        21: { id: 21, type: "reguler", subject: "REGULER 21", question: "Bagaimana peran aktif generasi muda dalam menjaga persatuan dan kesatuan bangsa Indonesia di era digital?", duration: 600 },
        22: { id: 22, type: "reguler", subject: "REGULER 22", question: "Selain mencegah konflik, bagaimana cara paling efektif untuk secara proaktif membangun rasa saling percaya antar-kelompok masyarakat yang berbeda di Indonesia?", duration: 600 },
        23: { id: 23, type: "reguler", subject: "REGULER 23", question: "Mengapa pemahaman sejarah perjuangan kemerdekaan Indonesia penting bagi generasi muda?", duration: 600 },
        24: { id: 24, type: "reguler", subject: "REGULER 24", question: "Bagaimana cara terbaik bagi generasi Anda untuk \"meneruskan perjuangan para pahlawan\" dalam konteks tantangan nasional masa kini?", duration: 600 },
        25: { id: 25, type: "reguler", subject: "REGULER 25", question: "Apa pentingnya generasi muda dalam memahami dan menerapkan nilai-nilal Pancasila dalam kehidupan sehari-hari?", duration: 600 },
        26: { id: 26, type: "reguler", subject: "REGULER 26", question: "Jelaskan apa yang menyebabkan munculnya disintegrasi bangsa dan apa yang bisa Anda lakukan dalam rangka mencegahnya.", duration: 600 },
        27: { id: 27, type: "reguler", subject: "REGULER 27", question: "Bagaimana peran generasi muda dalam menjaga persatuan dan kesatuan negara di era digital ini?", duration: 600 },
        28: { id: 28, type: "reguler", subject: "REGULER 28", question: "Bangsa yang besar adalah bangsa yang menghargai jasa dan perjuangan para pahlawan, selain itu juga mampu berdisiplin terhadap norma dan peraturan yang berlaku. Jelaskan pernyataan tersebut!", duration: 600 },
        29: { id: 29, type: "reguler", subject: "REGULER 29", question: "Apa makna Bhinneka Tunggal Ika sebagai semboyan negara?", duration: 600 },
        30: { id: 30, type: "reguler", subject: "REGULER 30", question: "Jelaskan penerapan sila-sila Pancasila dalam mewujudkan pembangunan nasional!", duration: 600 },
        31: { id: 31, type: "reguler", subject: "REGULER 31", question: "Bela negara merupakan salah satu hak dan kewajiban warga negara. Berikan contoh bela negara di lingkungan sekolah, masyarakat, berbangsa dan bernegara!", duration: 600 },
        32: { id: 32, type: "reguler", subject: "REGULER 32", question: "Jelaskan penerapan sila-sila Pancasila dalam kehidupan sehari-hari!", duration: 600 },
        33: { id: 33, type: "reguler", subject: "REGULER 33", question: "Prinsip demokrasi yang paling mendasar adalah...", duration: 600 },
        34: { id: 34, type: "reguler", subject: "REGULER 34", question: "Tujuan nasional Indonesia yang tercantum dalam Pembukaan UUD 1945 adalah ...", duration: 600 },
        35: { id: 35, type: "reguler", subject: "REGULER 35", question: "Jelaskan terkait dengan \"Wawasan Kebangsaan Membentuk Kesatuan Bersama\".", duration: 600 },
        36: { id: 36, type: "reguler", subject: "REGULER 36", question: "Jelaskan peran aktif anak muda dalam mempertahankan persatuan di era digital!", duration: 600 },
        37: { id: 37, type: "reguler", subject: "REGULER 37", question: "Jelaskan pentingnya toleransi bagi generasi muda.", duration: 600 },
        38: { id: 38, type: "reguler", subject: "REGULER 38", question: "Jelaskan prinsip anda terhadap perbedaan agama dalam lingkungan berbangsa dan bernegara.", duration: 600 },
        
        39: { id: 39, type: "special", subject: "SPECIAL 1", question: "Bagaimana cara menghindari disintegrasi dan apa yang kamu lakukan untuk menanggulangi disintegrasi dalam kehidupan berbangsan dan bernegara?", duration: 600 },
        40: { id: 40, type: "special", subject: "SPECIAL 2", question: "Apa pentingnya generasi muda dalam memahami dan menerapkan nilai-nilai Pancasila dalam kehidupan sehari-hari?", duration: 600 },
        41: { id: 41, type: "special", subject: "SPECIAL 3", question: "Jelaskan bagaimana cara mengamalkan Sila Pertama dari Pancasila dalam kehidupan sehari-hari!", duration: 600 },
        42: { id: 42, type: "special", subject: "SPECIAL 4", question: "Mengapa pemahaman sejarah perjuangan kemerdekaan Indonesia penting bagi generasi muda?", duration: 600 },
        43: { id: 43, type: "special", subject: "SPECIAL 5", question: "Jelaskan mengenai konsep Bela Negara dan apa yang bisa Kamu lakukan sebagai warga negera Indonesia untuk membela NKRI?", duration: 600 },
        44: { id: 44, type: "special", subject: "SPECIAL 6", question: "Bagaimana kontribusi generasi muda dalam memelihara keberagaman budaya di Indonesia?", duration: 600 },
        45: { id: 45, type: "special", subject: "SPECIAL 7", question: "Jelaskan tentang semboyan bangsa Indonesia dan apa yang bisa Kamu lakukan dalam rangka menjunjung tinggi semboyan bangsa Indonesia Ini?", duration: 600 },
        46: { id: 46, type: "special", subject: "SPECIAL 8", question: "Bagaimana peran generasi muda dalam melestarikan lingkungan hidup di Indonesia?", duration: 600 }
      };

      Object.keys(packagesList).forEach(id => {
        if (!packageStatus[id]) packageStatus[id] = 'belum_mulai';
      });

      savePackagesToStorage();
      saveStatusToStorage();
      renderAdminPackages();
      renderPackagesLandingGrid();
    }
