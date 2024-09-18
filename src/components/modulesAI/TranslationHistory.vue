<template>
    <div class="translation-history card">
      <h3>Historia tłumaczeń</h3>
      <DataTable :value="sortedHistory" :paginator="true" :rows="10"
                 :rowsPerPageOptions="[5, 10, 20, 50]"
                 stripedRows class="p-datatable-sm">
        <Column field="timestamp" header="Data" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.timestamp) }}
          </template>
        </Column>
        <Column field="from" header="Z" :sortable="true" />
        <Column field="to" header="Na" :sortable="true" />
        <Column field="original" header="Oryginalny tekst">
          <template #body="slotProps">
            {{ truncateText(slotProps.data.original) }}
          </template>
        </Column>
        <Column field="translated" header="Tłumaczenie">
          <template #body="slotProps">
            {{ truncateText(slotProps.data.translated) }}
          </template>
        </Column>
        <Column header="Akcje">
          <template #body="slotProps">
            <Button icon="pi pi-copy" class="p-button-rounded p-button-text"
                    @click="copyTranslation(slotProps.data)"
                    tooltip="Kopiuj tłumaczenie" />
            <Button icon="pi pi-replay" class="p-button-rounded p-button-text"
                    @click="reuseTranslation(slotProps.data)"
                    tooltip="Użyj ponownie" />
          </template>
        </Column>
      </DataTable>
    </div>
  </template>
  
  <script>
  import { defineComponent, computed } from 'vue';
  import { useTranslationStore } from '@/stores/translationStore';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import { format } from 'date-fns';
  import { pl } from 'date-fns/locale';
  
  export default defineComponent({
    name: 'TranslationHistory',
    components: {
      DataTable,
      Column,
      Button
    },
    setup() {
      const translationStore = useTranslationStore();
      const toast = useToast();
  
      // Zmieniono metodę na generowanie płytkiej kopii historycznych danych zamiast bezpośredniej referencji.
      const sortedHistory = computed(() => {
        return [...translationStore.history].sort((a, b) => b.timestamp - a.timestamp);
      });
  
      const formatDate = (timestamp) => {
        return format(new Date(timestamp), 'dd.MM.yyyy HH:mm', { locale: pl });
      };
  
      const truncateText = (text, maxLength = 30) => {
        return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      };
  
      const copyTranslation = (item) => {
        navigator.clipboard.writeText(item.translated).then(() => {
          toast.add({
            severity: 'success',
            summary: 'Skopiowano',
            detail: 'Tłumaczenie zostało skopiowane do schowka',
            life: 3000
          });
        });
      };
  
      const reuseTranslation = (item) => {
        translationStore.setSourceText(item.original);
        translationStore.setSourceLanguage(item.from);
        translationStore.setTargetLanguage(item.to);
        toast.add({
          severity: 'info',
          summary: 'Ponowne użycie',
          detail: 'Tłumaczenie zostało załadowane do edytora',
          life: 3000
        });
      };
  
      return {
        sortedHistory,
        formatDate,
        truncateText,
        copyTranslation,
        reuseTranslation
      };
    }
  });
  </script>
  
  <style scoped>
  .translation-history {
    margin-top: 2rem;
    padding: 1rem;
    background-color: var(--card-bg-light);
    transition: background-color 0.3s ease;
  }
  
  :deep(.p-datatable) {
    background-color: transparent;
  }
  
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-bg-color);
    color: var(--text-color);
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr) {
    background-color: var(--card-bg-light);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: var(--hover-bg-color);
  }
  
  [data-theme="dark"] .translation-history {
    background-color: var(--card-bg-dark);
  }
  
  [data-theme="dark"] :deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-bg-color);
    color: var(--text-dark);
  }
  
  [data-theme="dark"] :deep(.p-datatable .p-datatable-tbody > tr) {
    background-color: var(--card-bg-dark);
    color: var(--text-dark);
  }
  
  [data-theme="dark"] :deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: var(--hover-bg-color);
  }
  
  @media (max-width: 768px) {
    .translation-history {
      padding: 0.5rem;
    }
  
    :deep(.p-datatable .p-datatable-thead > tr > th),
    :deep(.p-datatable .p-datatable-tbody > tr > td) {
      padding: 0.5rem;
    }
  }
  </style>
  