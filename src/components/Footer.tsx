import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const githubUrl = "https://github.com/DuDupedrosa";
const linkedinUrl = "https://www.linkedin.com/in/eduardo-pedrosa-946787259/";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-700 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left">
          © {new Date().getFullYear()}{" "}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-colors duration-200 hover:text-gray-50"
          >
            @DuDupedrosa
          </a>
          . Todos os direitos reservados.
        </p>

        <div className="flex items-center gap-4">
          <a
            title="Linkeedin"
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faLinkedin} className="text-2xl" />
          </a>
          <a
            title="Github"
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-50 hover:text-gray-300 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faGithub} className="text-2xl" />
          </a>
        </div>
      </div>
    </footer>
  );
}
