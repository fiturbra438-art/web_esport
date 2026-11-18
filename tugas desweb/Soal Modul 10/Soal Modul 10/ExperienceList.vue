<template>
    <div class="row">
        <div class="col-md-4 mb-4" v-for="experience in experiences" :key="experience.company">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">{{ experience.company }}</h5><!--  SOAL: tampilkan nama perusahaan  -->
                    <h6 class="card-subtitle mb-2 text-muted">{{ ... }}</h6><!--  tampilkan posisi anda  -->
                    <p class="card-text">{{ ... }}</p><!--  tampilkan tahun pekerjaan  -->
                    <p class="card-text">{{ ... }}</p><!--  tampilkan deskripsi singkat dari pekerjaan  -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            experiences: [
                { company: '', position: '', year: '', description: '' },
                { company: '', position: '', year: '', description: '' } //SOAL : jangan lupa diisi dulu
            ]
        };
    }
};
</script>
  