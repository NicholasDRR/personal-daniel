
import { EducationManager } from "../EducationManager";

export const EducationSectionManager = () => {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">🎓 Formação e Certificações</h3>
        <p className="text-purple-800 text-sm">
          Gerencie sua formação acadêmica, certificações e cursos. Essas informações ajudam a transmitir credibilidade e confiança.
        </p>
      </div>
      <div className="min-h-[400px]">
        <EducationManager />
      </div>
    </div>
  );
};
