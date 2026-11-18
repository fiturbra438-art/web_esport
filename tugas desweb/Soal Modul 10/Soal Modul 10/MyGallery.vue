<template>
    <div class="row">
        <div class="col-md-4 mb-4" v-for="image in images" :key="image">
            <img :src="image" class="img-fluid" @click="openModal(image)" style="cursor: pointer;" />
        </div>

        <!-- Modal -->
        <div class="modal fade" id="galleryModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Image</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                        <div class="modal-body">
                        <img :src="selectedImage" class="img-fluid" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

export default {
    data() {
        return {
            images: ['https://picsum.photos/seed/picsum/300', 'https://picsum.photos/seed/picsum/300', 'https://picsum.photos/seed/picsum/300'],
            selectedImage: null,
        };
    },
    methods: {
        openModal(image) {
            this.selectedImage = image;
            const modal = new bootstrap.Modal(document.getElementById('galleryModal'));
            modal.show();
        }
    }
};
</script>
  