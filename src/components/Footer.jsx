export default function Footer() {
  return (
    <div className="mt-96 bottom-0 w-full">
      <div className="flex items-center my-4 before:border-t-2 before:flex-1 before:border-gray-300 after:border-t-2 after:flex-1 after:border-gray-300 " />
      <footer className="flex justify-between items-center max-w-6xl mx-auto text-md">
        <div className="relative">
          <p>&copy; 2023 Crețu Costin-Răzvan</p>
        </div>
        <div>
          <ul className=" flex space-x-5">
            <a href="https://github.com/costicretu" target="_blank" class="hover:underline text-blue-700 hover:text-blue-800 transition duration-150 ease-in-out">GitHub</a>
            <a href="https://www.linkedin.com/in/cre%C8%9Bucostinr%C4%83zvan/" target="_blank" class="hover:underline text-blue-700 hover:text-blue-800 transition duration-150 ease-in-out">LinkedIn</a>
          </ul>
        </div>
      </footer>
    </div>
  );
}

