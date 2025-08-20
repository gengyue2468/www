const Footnote = ({ children }) => {
  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold mb-4">脚注</h3>
      <div className="text-xs opacity-75 space-y-1">
        {children}
      </div>
    </div>
  );
};

export default Footnote;